import React from 'react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import './ContactUs.css';

import clock from "../assets/clock_img.png"
import phone from "../assets/phone_img.png"
import email from "../assets/email_img.png"

function ContactUs() {

    return (
      <div className="ContactUs">
        <Header />
        <div className='contact_section'>
          <div className='contact-flexbox'>
  
        <div class ="contact-flexbox left-box"> 
          <p><img src={email} alt = "clock" className="lImg" />Email <br /> sales@ezeeind.com.au </p>
          <p><img src={phone} alt = "clock" className="Img" />Phone <br />  07 3284 8180 </p>
              <p><img src={clock} alt = "clock" className="Img" />Opening Hours <br />  Mon-Thurs 7:30am to 4pm <br /> Friday 7:30am – 2pm </p>
          </div>
          
          <div class ="contact-flexbox right-box">
  
          
          <form target="_blank" action="https://formsubmit.co/ezeeplanterbox@gmail.com" method="POST" class ="contact-form"> 
            <table class >

                <tr>
                    <td><label for="fname">First Name:</label><br/>
                    <input type="text" id="first_name" name="first_name" placeholder="Your First Name..." /><br/>
                    </td>
                    <td> 
                        <label for="lname">Last name:</label><br/>
                        <input type="text" id="lname" name="last_name" placeholder="Your Last Name..." /><br/>
                    </td>
                </tr>
                <tr>
                    <td><label for="email">Email:</label><br/>
                    <input type="text" id="email" name="email" placeholder="Your Email..." /><br/><br /></td>
                    <td><label for="phone">Mobile Number:</label><br/>
                    <input type="text" id="mobile" name="mobile" placeholder="(optional)" /><br/><br /></td>
                </tr>
                <tr>
                    <td> 
                    <label for="inquiry">Enquiry:</label><br/>
                    <input type="text" id="inquiry" name="inquiry" placeholder="Write your inquiry here..." /><br/><br />
                    </td>
                </tr>
                </table>
                <button type="submit" class="submit-button">Submit Form</button>
        </form>          
  
          </div>
  
          </div>
  
          
        </div>
        <Footer />
      </div>
    );
    
  }
  
  export default ContactUs;
  





  