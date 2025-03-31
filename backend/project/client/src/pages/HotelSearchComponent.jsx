
            import { Helmet } from 'react-helmet-async';
            import HotelSearchComponent from 'src/sections/AI_generated/HotelSearchComponent.jsx';

            // ----------------------------------------------------------------------
            export default function AppPage() {
                return (
                <>
                    <Helmet>
                    <title> Dashboard | Minimal UI </title>
                    </Helmet>
                    <HotelSearchComponent />
                </>
                );
            }
            