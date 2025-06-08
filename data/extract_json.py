import json

def extract_json(curl_output):
    try:
        data = json.loads(curl_output)
        raw_data = data.get('rawData', '')
        json_string = raw_data.replace('```json', '').replace('```', '')
        extracted_json = json.loads(json_string)
        return extracted_json
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

try:
    with open('curl_output.txt', 'r') as f:
        curl_output = f.read()
    extracted_json = extract_json(curl_output)
    if extracted_json:
        print(json.dumps(extracted_json, indent=2))
except FileNotFoundError:
    print("Error: curl_output.txt not found")