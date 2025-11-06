import logo from './../../assets/logo1.png';
import { FaEnvelope, FaPhone } from 'react-icons/fa6'

function Header() {

  return (
    <>
        <div className="logo"><img src={logo} alt="modelcam" /></div>
        <div className="contact"><FaPhone size={15} style={{ verticalAlign: "middle", marginRight: '5px' }}/>&nbsp;+91 8237016167 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <FaEnvelope  size={15} style={{ verticalAlign: "middle", marginRight: '5px' }}/>&nbsp;sales@modelcamtechnologies.com</div>
    </>
  )
}

export default Header