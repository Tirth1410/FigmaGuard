
            import { Helmet } from 'react-helmet-async';
            import RoomList from 'src/sections/AI_generated/RoomList.jsx';

            // ----------------------------------------------------------------------
            export default function AppPage() {
                return (
                <>
                    <Helmet>
                    <title> Dashboard | Minimal UI </title>
                    </Helmet>
                    <RoomList />
                </>
                );
            }
            