
            import { Helmet } from 'react-helmet-async';
            import HotelRoom from 'src/sections/AI_generated/HotelRoom.jsx';

            // ----------------------------------------------------------------------
            export default function AppPage() {
                return (
                <>
                    <Helmet>
                    <title> Dashboard | Minimal UI </title>
                    </Helmet>
                    <HotelRoom />
                </>
                );
            }
            