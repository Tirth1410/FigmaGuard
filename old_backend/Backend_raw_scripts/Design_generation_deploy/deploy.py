import os
import subprocess

# Get the correct project path (same level as front_gen)
base_dir = os.path.dirname(os.path.abspath(__file__))  
root_dir = os.path.dirname(base_dir)  # Moves up to the root level
project_dir = os.path.join(root_dir, "project")  # Ensures project/ is at the same level as front_gen
client_dir = os.path.join(project_dir, "client")  # Path to React frontend

print(f"Expected project path: {project_dir}")
print(f"Expected client path: {client_dir}")


if not os.path.exists(project_dir):
    print("❌ Error: Project folder not found at the expected location!")
    print("📁 Available directories in root:", os.listdir(root_dir))
    exit(1)

if not os.path.exists(client_dir):
    print("❌ Error: Client folder not found inside project!")
    print("📁 Available directories in project:", os.listdir(project_dir))
    exit(1)


print(f"[+] Found client at {client_dir}, deploying to Vercel...")
os.chdir(client_dir)  

try:
    subprocess.run([r"C:\Users\hp\AppData\Roaming\npm\vercel.cmd", "deploy", "--prod"], check=True)

    print("✅ Deployment successful!")
except subprocess.CalledProcessError as e:
    print(f"❌ Deployment failed: {e}")
    exit(1)
    