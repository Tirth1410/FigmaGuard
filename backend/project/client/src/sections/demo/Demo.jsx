import React  , {useContext , useEffect} from 'react'
import Extra from './Extra'




import {fetcher , useFetch} from 'src/hooks/Fetcher'
export default function Demo() {

   // outside the functions in main function use useFtech
   const [data_add , load_add , error_add] = useFetch("/sashrik/add" , {a:2,b:4})

   console.log(data_add) ; 


   const handel_submit =  async ()=>{
    const data  = await fetcher("/sashrik/add" , {a:4 , b:4})
    console.log(data)  ; 
   }
  
  return (
    <div>Demo
      <Extra/>
      <button
      onClick = {handel_submit}
      >submit</button>
    </div>
  )
}
