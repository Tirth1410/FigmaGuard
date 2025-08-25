import google.generativeai as genai
import typing_extensions as typing
import json
import os
from typing import Optional, List
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI
import subprocess
import shutil
import warnings
import regex as re 
import signal 

warnings.filterwarnings("ignore")

llama3 = ChatOpenAI(api_key="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", 
                        base_url="https://api.groq.com/openai/v1",
                        model="llama-3.3-70b-versatile",
                    )

class gen_file():


    class WebPage(BaseModel):
        FileName_frontend: str = Field(description="name of the reactjs file with extention jsx ")
        Component: str = Field(description="name of the exported react componenet")
        frontend: str = Field(description="the entire code for react js (!! only code)  !!!!! PROVIDE FULL END TO END CODE COMPLETE CODE LEAVE NO AREA FOR COMPLETION !!! i shoould not edit this code this is final version")


    class Frontend(BaseModel):
        frontend: str = Field(description="the entire code for react js (!! only code)  !!!!! PROVIDE FULL END TO END CODE COMPLETE CODE LEAVE NO AREA FOR COMPLETION !!! i shoould not edit this code this is final version")
  

    def __init__(self, prompt,full_database , template, front='' , ai=False):
        self.ai_prompt = ''
        if ai : 
            self.ai_prompt=f"""
                        """
        self.full_database = full_database 
        self.template = template
        self.code = self.add_file(prompt, front)




    def add_file(self, text, front):
        prompt =f"""

```
Create a complete React JS frontend component with the following specifications:

## Component Requirements
- Component Name: [Component name starting with capital letter]
- Filename: [Filename starting with capital letter and ending with .jsx]

## Technical Requirements
- Use React JS with functional components and hooks
- Implement Tailwind CSS for styling (using inline classes only)
- No need to import Tailwind - using CDN
- Create a beautiful, elegant, and minimal design
- FRONTEND ONLY - no backend connectivity
- HARDCODE all necessary data directly in the component
- Include sample data to demonstrate functionality

## Content Details
{text}

## Image Integration
Use this function to fetch images from Unsplash:

```javascript
async function getImageUrl(keyword) {{
  const clientId = "J3Af0qhs3oT2DAqbTjP9IAwgM575BYNOrJlAcC-BtZs";
  const url = `https://api.unsplash.com/search/photos?query=${{encodeURIComponent(keyword)}}&per_page=1&client_id=${{clientId}}`;
  
  try {{
    const response = await fetch(url);
    const data = await response.json();
    return data.results.length > 0 ? data.results[0].urls.regular : null;
  }} catch (error) {{
    console.error("Error fetching image:", error);
    return null;
  }}
}}
```

by the above function get images and diplay it accoding to you 

inculde this function in your code the above is not implimented any where in directory 


also include alll directories , libraires give full code 


## Output Requirements
1. Complete component code
2. Filename (starting with capital letter, ending with .jsx)
3. Component name to be exported
```


                    """
        code = llama3.with_structured_output(gen_file.WebPage).invoke(prompt)
        gen_code_1 = {
            'FileName_frontend' : code.FileName_frontend , 
            'frontend' : code.frontend , 
            'Component' : code.Component 
            }
        
        # Define file paths
        location_to_front_page = "..\\project\\client\\src\\sections\\AI_generated"
        location_to_pages = "..\\project\\client\\src\\pages"
        location_to_routes = "..\\project\\client\\src\\routes\\sections.jsx"
        location_to_navigation = "..\\project\\client\\src\\layouts\\dashboard\\config-navigation.jsx"
        location_to_controller = "..\\project\\server\\controllers"
        # Write generated code to file
        with open(location_to_front_page + "\\" + gen_code_1['FileName_frontend'], 'w', encoding='utf-8') as file:
            file.write(gen_code_1['frontend'])
        
        # Create the corresponding page
        with open(location_to_pages + "\\" + gen_code_1['FileName_frontend'], 'w', encoding='utf-8') as file:
            file.write(f"""
            import {{ Helmet }} from 'react-helmet-async';
            import {gen_code_1['Component']} from 'src/sections/AI_generated/{gen_code_1['FileName_frontend']}';

            // ----------------------------------------------------------------------
            export default function AppPage() {{
                return (
                <>
                    <Helmet>
                    <title> Dashboard | Minimal UI </title>
                    </Helmet>
                    <{gen_code_1['Component']} />
                </>
                );
            }}
            """)
        
        # Update routes
        with open(location_to_routes, 'r', encoding='utf-8') as file:
            lines = file.readlines()
        
        new_page_import = f"export const {gen_code_1['Component']} = lazy(() => import('src/pages/{gen_code_1['FileName_frontend']}'));\n"
        new_route_entry = f"{{ path: 'ai/{gen_code_1['Component']}', element: <{gen_code_1['Component']}/> }},\n"
        
        for i, line in enumerate(lines):
            if "//add_new_page_here" in line:
                lines.insert(i, new_page_import) 
                break  
        for i, line in enumerate(lines):
            if "//add_new_link_here" in line:
                lines.insert(i, new_route_entry) 
                break  
        
        with open(location_to_routes, 'w', encoding='utf-8') as file:
            file.writelines(lines)
        
        # Update navigation
        with open(location_to_navigation, 'r') as file:
            lines = file.readlines()
        
        insert_index = None
        for i, line in enumerate(lines):
            if "//new_nav_to_add" in line:
                insert_index = i
                break
        
        new_nav_item = f"""{{
            title: '{gen_code_1['Component']}',
            path: '/ai/{gen_code_1['Component']}',
        }},"""
        
        if insert_index is not None:
            lines.insert(insert_index, new_nav_item + "\n")
            with open(location_to_navigation, 'w') as file:
                file.writelines(lines)
        
        print(f"[+] file created at url : http://localhost:3030/ai/{gen_code_1['Component']}")


        
        return gen_code_1

    def remove_file(self): 
     file_name = self.code['Filenmae_frontend']
     component = self.code['Component']
     location_to_frontend = "..\\project\\client\\src\\sections\\AI_generated\\" + file_name 
     os.remove(location_to_frontend)
     location_to_pages = "..\\project\\client\\src\\pages\\"+file_name
     os.remove(location_to_pages)
     location_to_routes = "..\\project\\client\\src\\routes\\sections.jsx"
     lines_to_delete = [
          f"export const {component} = lazy(() => import('src/pages/{file_name}'));\n" , 
          f"        {{ path: 'ai/{component}', element: <{component}/> }},\n"
     ]
     with open(location_to_routes, 'r') as file:
          lines = file.readlines()
     new_lines = [line for line in lines if line not in lines_to_delete]
     with open(location_to_routes, 'w') as file:
            file.writelines(new_lines)
     location_to_navigation = "..\\project\\client\\src\\layouts\\dashboard\\config-navigation.jsx"
     start_marker = f"{{\n    title: '{component}',\n    path: '/ai/{component}',\n  }},\n"
     with open(location_to_navigation, 'r') as file:
            content = file.read()
     updated_content = content.replace(start_marker, '')
     with open(location_to_navigation, 'w') as file:
            file.write(updated_content)

    def edit_frontend(self , prompt):
        filename = self.code['FileName_frontend']
        location_to_frontend = "..\\project\\client\\src\\sections\\AI_generated\\" + filename 
        with open(location_to_frontend, 'r', encoding='utf-8') as file : 
            content = file.read()
        
        prompt = f"""

             => given the previous react js codes 
                    following 
                     1. description  : {content}
                    
                    edit the file for the following : 
                    {prompt}
                    use tailwind css only 
        """
        code = llama3.with_structured_output(gen_file.Frontend).invoke(prompt)
        with open(location_to_frontend, 'w', encoding='utf-8') as file:
            file.write(code.frontend)

    def edit_fullstack(self , prompt):
        front = self.code['FileName_frontend']
        back = self.code['FileName_backend']
        location_to_frontend = "..\\project\\client\\src\\sections\\AI_generated\\" + front 
        with open(location_to_frontend, 'r', encoding='utf-8') as file : 
            front_content = file.read()
        location_to_controller = "..\\project\\server\\controllers\\" + back 
        with open(location_to_controller, 'r', encoding='utf-8') as file :
            back_content = file.read()
        
        prompt= f"""
        => given the following node js code : 
        {back_content}
        and frontend code in react js : 
        {front_content}
        change the above code to perform the following : 
        {prompt}
        """
        code = llama3.with_structured_output(gen_file.FullStack).invoke(prompt)
        with open(location_to_frontend, 'w', encoding='utf-8') as file:
            file.write(code.frontend)
        with open(location_to_controller, 'w', encoding='utf-8') as file:
            file.write(code.backend)




    

class Website:   
    
    class Structure(typing.TypedDict):
        code: str
        database_file_name: str
        database_name: str

    class Pages(typing.TypedDict):
        page_desc: list[str]

    def __init__(self, text: str , install=True):
        print("[+] installing the base folder directory")
        self.clone_repo()
        self.print_instructions()
        self.files = {}
        self.text = text
        self.genai = genai  
        self.genai.configure(api_key="AIzaSyBsP6HpWIAUaPCGUAOoE1X4weyD_YX9_hY")
        self.model = self.genai.GenerativeModel("gemini-1.5-pro-latest")
        gen_descriptions = self.model.generate_content(
            f"""
            for the following request: {self.text}
            give description for webpages (simple) in a list for example:
            ['webpage_desc1', 'webpage_desc2', ...]
            total number of strings should be equal to that of total pages 
            """,
            generation_config=self.genai.GenerationConfig(
                response_mime_type="application/json", response_schema=Website.Pages
            )
        )
        print("[+] creating blueprint about project files")
        self.description = json.loads(gen_descriptions.candidates[0].content.parts[0].text)
        if install : 
            print("[+] installing dependencies")
            self.install()
        print("[+] adding web files")
        self.add_files()
        print("[+] website created at http://localhost:3030/")


    def clone_repo(self):
        original_path = os.getcwd()

        try:
            os.chdir('..')
            subprocess.run(["git", "clone", "https://github.com/22bce315/project.git"], check=True)
            print("[+] Project initialized")

        except subprocess.CalledProcessError as e:
            print(f"Error cloning repository: {e}")
        finally:
            os.chdir(original_path)

    def print_instructions(self):
        instructions = """[+] Your server should start running"""
        print(instructions)





    def create_database(self):

                
        desc = self.model.generate_content(
                        f"""
                        given {self.text} is a description of website design databse for it 
                        
                        generate mongo database code in the following format (only code no documentation): 

                        for ex (use this template to make db code ) : 
                        
                        ----------------------------------------------------------------
                            const mongoose = require("mongoose");
                            const Schema = mongoose.Schema;

                            const userSchema = new Schema({{
                            name: {{
                                type: String,
                                required: true,
                            }},
                            email: {{
                                type: String,
                                required: true,
                                unique: true,
                            }}
                            }});

                            const User = mongoose.model("User", userSchema);

                            module.exports = {{ db1 , db2}};
                            ----------------------------------------------------------------

                            give code in the following format :
                            code : db_code 
                            database_file_name : name of file 
                            database_name : exported_db_name1 , exported_db_name2 ..
                            
                        """,
                        generation_config=genai.GenerationConfig(
                            response_mime_type="application/json", response_schema=Website.Structure
                        ),
                    )
                    
        gen_desc = json.loads(desc.candidates[0].content.parts[0].text)
        location_to_model_folder = "..\\project\\server\\models"
        self.full_database = gen_desc['code']  
        self.db_name = gen_desc['database_file_name']
        import_statements = f"const {{{gen_desc['database_name']}}} = require(\"../models/{gen_desc['database_file_name']}\")\n"
        self.backend_template = import_statements + """"
            const express = require("express");
            const router = express.Router();

            // follow the folowing template 
            // you should add api here and else import /export part should remain same 
            // router.route("/path").get((req , res)=>{{your api working}})

            module.exports = router;
            """
        with open(location_to_model_folder + "\\" + gen_desc['database_file_name'], 'w', encoding='utf-8') as file:
                        file.write(gen_desc['code'])


    def edit_database(self , prompt):
        location_to_model_folder = "..\\project\\server\\models\\" + self.db_name
        with open(location_to_model_folder, 'w', encoding='utf-8') as file:
            db_content = file.read()
        prompt = f"""

           this is my current database : 
           {db_content}
           for the following instruction : 
           {prompt}
            edit schema NOTE do not change name of schema or db 
        """
        desc = self.model.generate_content(prompt , 
                                               generation_config=genai.GenerationConfig(
                            response_mime_type="application/json", response_schema=Website.Structure
                        ))
        gen_desc = json.loads(desc.candidates[0].content.parts[0].text)
        location_to_model_folder = "..\\project\\server\\models"
        self.full_database = gen_desc['code']  
        self.db_name = gen_desc['database_name']
        import_statements = f"const {{{gen_desc['database_name']}}} = require(\"../models/{gen_desc['database_file_name']}\")\n"
        self.backend_template = import_statements + """"
            const express = require("express");
            const router = express.Router();

            // follow the folowing template 
            // you should add api here and else import /export part should remain same 
            // router.route("/path").get((req , res)=>{{your api working}})

            module.exports = router;
            """
        with open(location_to_model_folder + "\\" + gen_desc['database_file_name'], 'w', encoding='utf-8') as file:
                        file.write(gen_desc['code'])
        




    def add_files(self):
        for page_info in self.description['page_desc']:
            success = False
            while not success:
                try:
                    web_file = gen_file(page_info, '' , '', '')
                    self.files[web_file.code['Component']] = web_file
                    success = True  # Mark as successful if no exception occurs
                except Exception as e:
                    print(f"Error occurred: {e}. Retrying...")

    def add_file(self , prompt , ai=False):
        page_info = prompt
        success = False
        while not success:
            try:
                web_file = gen_file(page_info, self.full_database, self.backend_template, '' , ai)
                self.files[web_file.code['Component']] = web_file
                success = True  # Mark as successful if no exception occurs
            except Exception as e:
                print(f"Error occurred: {e}. Retrying...")


    def install(self):
        current = os.getcwd()
        try : 
            os.chdir("../project/client")
            result = subprocess.run(['npm' , 'install'], shell=True, capture_output=True, text=True)
            os.chdir("../server")
            result = subprocess.run(['npm' , 'install'], shell=True, capture_output=True, text=True)
            os.chdir("../../llm_gen")
        except:
            print("error")
            os.chdir(current)
        finally: 
            os.chdir(current)

    def add_file_by_image(self , url , prompt ,ai=False):
        genai.configure(api_key="AIzaSyBsP6HpWIAUaPCGUAOoE1X4weyD_YX9_hY")
        myfile = genai.upload_file(url)
        print(f"{myfile=}")
        model = genai.GenerativeModel("gemini-1.5-flash")
        result = model.generate_content(
            [myfile, "\n\n", """given the template for web site describe the 
            layout of each page in following format (for quentities use vh(viwewport hieght ) or vw(viewport width)) : 
                component_name : 
                position : 
                hieght : 
                width : 
                any style : such as curved bored shadow etc...
                just give general outline no neet to be percise
                """]
        )
        fr = f"{result.text=}"
        page_info = prompt
        success = False
        while not success:
            try:
                web_file = gen_file(page_info, self.full_database, self.backend_template, front=fr , ai=ai)
                self.files[web_file.code['Component']] = web_file
                success = True  # Mark as successful if no exception occurs
            except Exception as e:
                print(f"Error occurred: {e}. Retrying...")


    def start_servers(self):
        current = os.getcwd()
        client_pid, server_pid = None, None
        client_port, server_port = None, None
        
        try:
            # Start client (React) server
            os.chdir("../project/client")
            client_process = subprocess.Popen(['npm', 'run', 'dev'], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            client_pid = client_process.pid
            os.chdir("../server")
            server_process = subprocess.Popen(['nodemon', 'index.js'], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            server_pid = server_process.pid
            
            os.chdir("../../llm_gen")

        except Exception as e:
            print(f"Error: {e}")
            os.chdir(current)
        finally:
            os.chdir(current)
        print(f"[+] Client running in the background with PID {client_pid}")
        print(f"[+] Server running in the background with PID {server_pid}")
        self.client_pid = client_pid
        self.server_pid = server_pid
        self.client_process = client_process
        self.server_process = server_process



    def stop_servers(self):
        # Stop the client server
        if self.client_pid:
            try:
                os.kill(self.client_pid, signal.SIGTERM)
                print(f"[+] Client server with PID {self.client_pid} has been stopped.")
            except ProcessLookupError:
                print(f"[-] No process found with PID {self.client_pid}.")
            except Exception as e:
                print(f"Error stopping client server: {e}")
        else:
            print("[-] Client server PID not available.")

        # Stop the server (Node.js) server
        if self.server_pid:
            try:
                os.kill(self.server_pid, signal.SIGTERM)
                print(f"[+] Node.js server with PID {self.server_pid} has been stopped.")
            except ProcessLookupError:
                print(f"[-] No process found with PID {self.server_pid}.")
            except Exception as e:
                print(f"Error stopping Node.js server: {e}")
        else:
            print("[-] Node.js server PID not available.")

        # Reset the stored PIDs and ports
        self.client_pid = None
        self.client_port = None
        self.server_pid = None
        self.server_port = None
        