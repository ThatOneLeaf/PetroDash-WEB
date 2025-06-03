import Container from '@mui/material';
import Modal from '../../../components/modal';

function AddRecordModal() {
    const [isModal, setModal] = useState(false);

    const toggleModal = () => {
        setLoginModal(!isLoginModal);
    };

    return (
        <Modal onClose={toggleModal}>
            <Container sx={{ background: 'white' }}>

            </Container>
        </Modal>

        
    )
}

export default AddRecordModal;