// Fetcher.js

import React, { useContext  , useState , useEffect} from "react";
import { curr_context } from "src/contexts/Central";
import { backend_url } from "../contexts/url"
const fetcher = async (url, body) => {

   if (!body) {
      try {
         const response = await fetch(backend_url + url, {
            method: 'GET',
            headers: {
               'Cache-Control': 'no-cache, no-store, must-revalidate',
               'Pragma': 'no-cache',
               'Expires': '0'
            }
         });
         const data = await response.json();
         return data;
      } catch (error) {
         console.log(error);
      }
   } else {
      try {
         const response = await fetch(backend_url + url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
               "Content-type": "application/json; charset=UTF-8"
            }
         });
         const data = await response.json();
         return data;
      } catch (error) {
         console.log(error);
      }
   }
   return "";
};




 function useFetch(url , body){ 
   const [data , set_data] = useState({}) ; 
   const [loading , set_loading] = useState(false) ;
   const [error , set_error] = useState(false) ; 


   if(!body){
     useEffect(()=>{
       (async()=>{
           try{
             set_loading(true)
             const response = await fetch(backend_url+url ,{
               method: 'GET',
               headers: {
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  'Pragma': 'no-cache',
                  'Expires': '0'
               }
            })
             const data = await response.json()
             set_data(data)
             set_loading(false)
           }
           catch(error){
             console.log(error)
             set_loading(false) 
             set_error(true) 
           }
       })()
     } , [])
   }
   else{
     useEffect(()=>{
       (async()=>{
           try{
             set_loading(true)
             const response = await fetch(backend_url+url ,{
               method: "POST",
               body: JSON.stringify(body),
               headers: {
                 "Content-type": "application/json; charset=UTF-8"
               }
             } )
             const data = await response.json()
             set_data(data)
             set_loading(false)
           }
           catch(error){
             set_loading(false) ;
             console.log(error)
             set_error(true) 
           }
       })()
     } , [])
   }


   return [data , loading , error] ; 
 }
 





export { fetcher  , useFetch};
