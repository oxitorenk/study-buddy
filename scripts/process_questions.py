import pypdf
import json
import re
import sys
import os

def normalize_text(text):
    return "".join(text.split()).lower()

def extract_from_pdf(pdf_path):
    reader = pypdf.PdfReader(pdf_path)
    full_text = ""
    for page in reader.pages:
        full_text += page.extract_text() + "\n"
    return full_text

def parse_questions(text):
    # Detect the booklet (Group A or B)
    # We'll try to parse Group A if available, then B if not.
    
    parts = text.split("ANADOLU KÜLTÜR TARİHİ A")
    if len(parts) < 2:
         # Fallback to B if A not found
         parts = text.split("ANADOLU KÜLTÜR TARİHİ B")
         booklet = "B"
    else:
         booklet = "A"

    if len(parts) < 2:
        return []
    
    # Text between the header and the answer key
    main_text = parts[1].split(f"{booklet} Grubu Cevap Anahtarı")[0]
    
    # Cleanup noise
    main_text = re.sub(r'\d+-\d+ BAHAR DÖNEM SONU.*', '', main_text)
    main_text = re.sub(r'Açıköğretim Sistemi.*', '', main_text)
    main_text = re.sub(r'Anadolu Üniversitesi.*', '', main_text)
    main_text = re.sub(r'AOSDESTEK.*', '', main_text)
    main_text = re.sub(r'.*Bu yasağa uymayanlar.*', '', main_text)
    main_text = re.sub(r'.*Öğretim Yılı.*', '', main_text)
    main_text = re.sub(r'.*Bahar Dönemi Dönem Sonu Sınavı.*', '', main_text)
    main_text = re.sub(r'\n[A-B]\n', '\n', main_text)
    main_text = re.sub(r'\n\d\n', '\n', main_text)
    
    # Answer key parsing
    answer_key_part = parts[1].split(f"{booklet} Grubu Cevap Anahtarı")[1].split("\n")
    key_line = ""
    for line in answer_key_part:
        clean_line = line.strip()
        if re.match(r'^[A-E ]+$', clean_line) and len(clean_line.split()) >= 10:
            key_line = clean_line
            break
    answers = key_line.split()
    
    questions = []
    markers = list(re.finditer(r'\n(\d+)\.\n', main_text))
    
    for i in range(len(markers)):
        num = int(markers[i].group(1))
        
        q_start = 0
        if i > 0:
            e_match = list(re.finditer(r'E\)\n', main_text[:markers[i].start()]))
            if e_match:
                q_start = e_match[-1].end()
            else:
                q_start = markers[i-1].end()
        
        q_text = main_text[q_start:markers[i].start()].strip()
        
        block_start = markers[i].end()
        block_end = markers[i+1].start() if i+1 < len(markers) else len(main_text)
        block = main_text[block_start:block_end]
        
        options = {}
        opt_markers = list(re.finditer(r'\n([A-E])\)\n', block))
        
        if opt_markers:
            options['A'] = block[:opt_markers[0].start()].strip()
            for j in range(len(opt_markers)):
                letter = opt_markers[j].group(1)
                start_idx = opt_markers[j].end()
                end_idx = opt_markers[j+1].start() if j+1 < len(opt_markers) else len(block)
                
                next_letter = chr(ord(letter) + 1)
                if next_letter <= 'E':
                    options[next_letter] = block[start_idx:end_idx].strip()
            
            # E text needs cleanup from upcoming text
            if 'E' in options:
                options['E'] = options['E'].split('\n')[0].strip()

        if q_text and len(options) == 4: # Wait, if it only has A-D, we might be missing E if it jumbled
             pass # Will check below
             
        if q_text and len(options) == 5:
            questions.append({
                "questionText": q_text,
                "options": options,
                "correctAnswer": answers[num-1] if (num-1) < len(answers) else "?"
            })
            
    return questions

def merge(new_questions, target_json):
    with open(target_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    existing_texts = {normalize_text(q['questionText']) for q in data.get('finalExam', [])}
    
    added = 0
    skipped = 0
    for q in new_questions:
        if normalize_text(q['questionText']) not in existing_texts:
            data['finalExam'].append(q)
            existing_texts.add(normalize_text(q['questionText']))
            added += 1
        else:
            skipped += 1
            
    with open(target_json, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print(f"Merge Result: {added} added, {skipped} skipped.")

if __name__ == "__main__":
    pdf = sys.argv[1]
    target = sys.argv[2]
    
    text = extract_from_pdf(pdf)
    qs = parse_questions(text)
    merge(qs, target)
