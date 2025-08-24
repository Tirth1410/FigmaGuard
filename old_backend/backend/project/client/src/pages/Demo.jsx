import { Helmet } from 'react-helmet-async';
import Demo from 'src/sections/demo/Demo';


// ----------------------------------------------------------------------

export default function AppPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard | Minimal UI </title>
      </Helmet>

     <Demo/>
    </>
  );
}
