import React, { createContext, useContext, useState, useEffect } from "react";
import { fetcher } from "src/hooks/Fetcher";
export const curr_context = createContext();

export default function Central(props) {

  const backend_url = "http://localhost:7000" 
  const [userid , set_userid] = useState(null)
  const [google_user , set_google_user] = useState(null) 
  const [user , set_user] = useState(null)
  useEffect(()=>{

    (async()=>{
      if(google_user){
        let body = {
          name : google_user.name ,
          email : google_user.email ,
          picture : google_user.picture,
          password : "12345678"
        }
        await fetcher("/aagam/add_if_not" , body)
        const data = await fetcher("/aagam/userid" , {email : google_user.email})
        set_userid(data._id)
        set_user(data)
      }
    })()

  } , [google_user])
  return (
    <>
      <curr_context.Provider value={{backend_url , user , set_user  ,google_user , userid ,set_google_user}}>
        {props.children}
      </curr_context.Provider>
    </>
  );
}

