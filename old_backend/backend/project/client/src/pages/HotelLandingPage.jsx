
            import { Helmet } from 'react-helmet-async';
            import HotelLandingPage from 'src/sections/AI_generated/HotelLandingPage.jsx';

            // ----------------------------------------------------------------------
            export default function AppPage() {
                return (
                <>
                    <Helmet>
                    <title> Dashboard | Minimal UI </title>
                    </Helmet>
                    <HotelLandingPage />
                </>
                );
            }
            