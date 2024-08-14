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
            <h1>
                Contact Us
            </h1>
            <h2> We'd love to hear all general enquiries you may have about Ezee Planter Boxes. Contact us via the form below, call our office on 07 3284 8180, or drop in for a chat at our office at: 21 Huntington Street, Clontarf QLD 4019 </h2>
          <div className='contact-flexbox'>
  
        <div class ="contact-flexbox left-box"> 
          <p><img src={email} alt = "clock" className="lImg" />Email <br /> sales@ezeeind.com.au </p>
          <p><img src={phone} alt = "clock" className="Img" />Phone <br />  07 3284 8180 </p>
              <p><img src={clock} alt = "clock" className="Img" />Opening Hours <br />  Mon-Thurs 7:30am to 4pm <br /> Friday 7:30am – 2pm </p>
          </div>
          
          <div class ="contact-flexbox right-box">
  
          
          <form target="_blank" action="https://formsubmit.co/ezeeplanterbox@gmail.com" method="POST" class ="contact-form"> 
            <table class="form-table">

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
                    <input type="text" id="email" name="email" placeholder="Your Email..." /><br/></td>
                    <td><label for="phone">Mobile Number:</label><br/>
                    <input type="text" id="mobile" name="mobile" placeholder="(optional)" /><br/></td>
                </tr>
                <tr>
                    <td colspan="2"> 
                    <label for="inquiry">Enquiry:</label><br/>
                    <textarea id="inquiry" name="inquiry" placeholder="Write your inquiry here..." > </textarea>
                    {/* <input type="text" id="inquiry" name="inquiry" placeholder="Write your inquiry here..." /><br/><br /> */}
                    </td>
                </tr>
                </table>
                <button type="submit" class="submit-button">Submit Form</button>
        </form>          
  
          </div>
  
          </div>
          
        </div>
        <div className='map_section'>
          <iframe loading="lazy" src="https://maps.google.com/maps?q=21%20Huntington%20Street%2C%20Clontarf%20QLD%204019&amp;t=m&amp;z=16&amp;output=embed&amp;iwloc=near" 
          title="21 Huntington Street, Clontarf QLD 4019" aria-label="21 Huntington Street, Clontarf QLD 4019" width='100%' height='85%' frameborder="0"></iframe>
        </div>
        <Footer />
      </div>
    );
    
  }
  
  export default ContactUs;
  





  