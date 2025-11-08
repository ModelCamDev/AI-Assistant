import { FaArrowRightLong } from 'react-icons/fa6';
import demoRightImage from './../assets/demo-section-right-image.jpg.jpg';
const DemoPage = () =>{
  return (
    <>
    <div className="navbar">
      <div className="nav-item">Home</div>
      <div className="nav-item">Services</div>
      <div className="nav-item">About us</div>
      <div className="nav-item">IOT Courses</div>
      <div className="nav-item">Blogs</div>
      <div className="nav-item">Career</div>
      <div className="nav-item">Contact</div>
    </div>
    <div className="demo-page-section">
        <div className="section-left">
            <h3>AI in Manufacturing, Digital twin, PLM</h3>
            <h1>Empowering smarter, faster, and more efficient manufacturing with cutting-edge technology.</h1>
            <p>
                AI, Digital Twins, and PLM are reshaping manufacturing by creating virtual replicas of systems for real-time monitoring and optimization. This synergy enhances decision-making, streamlines workflows, and accelerates product development, leading to improved efficiency, reduced costs, and faster time-to-market for manufacturers.
            </p>
            <button>Explore more <FaArrowRightLong /></button>
        </div>
        <div className="section-right">
            <img src={demoRightImage} alt="RightSectionImage" />
        </div>
    </div>
    </>
  )
}

export default DemoPage
