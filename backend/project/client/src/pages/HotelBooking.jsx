
            import { Helmet } from 'react-helmet-async';
            import HotelBooking from 'src/sections/AI_generated/HotelBooking.jsx';

            // ----------------------------------------------------------------------
            export default function AppPage() {
                return (
                <>
                    <Helmet>
                    <title> Dashboard | Minimal UI </title>
                    </Helmet>
                    <HotelBooking />
                </>
                );
            }
            