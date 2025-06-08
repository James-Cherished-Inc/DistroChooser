import json
import os

def compile_distros(distros_dir, output_file):
    all_distros_data = []

    # Iterate through files in the distros directory
    for filename in os.listdir(distros_dir):
        if filename.endswith('.json'): # Process only JSON files
            filepath = os.path.join(distros_dir, filename)
            try:
                with open(filepath, 'r') as f:
                    distro_data = json.load(f)
                    all_distros_data.append(distro_data)
            except json.JSONDecodeError:
                print(f"Error decoding JSON in file: {filepath}")
                # Handle error - maybe skip or log
            except Exception as e:
                print(f"An error occurred reading file {filepath}: {e}")
                # Handle other potential errors

    # Write the combined data to the output file
    try:
        with open(output_file, 'w') as f:
            json.dump(all_distros_data, f, indent=2) # Use indent for readability
        print(f"Successfully compiled data to {output_file}")
    except Exception as e:
        print(f"An error occurred writing to {output_file}: {e}")
        # Handle error

if __name__ == "__main__":
    distros_dir = 'data/distros'
    output_file = 'data/distributions.json'
    compile_distros(distros_dir, output_file)