import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white shadow-2xl text-white py-8">
      <div className="max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold pb-4 w-[30%] text-black border-b-2 border-blue-500">About Us</h3>
            <p className="text-sm mt-4 text-black w-[75%]">
              We are a team of passionate developers building amazing web
              applications with modern technologies.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="text-black">
            <h3 className="text-lg font-bold pb-4 w-[40%] border-b-2 border-blue-500">Quick Links</h3>
            <ul className="space-y-2 mt-4">
              <li>
                <a href="/" className="hover:text-blue-500 duration-300">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-blue-500 duration-300">
                  About
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-blue-500 duration-300">
                  Services
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-blue-500 duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="text-black">
            <h3 className="text-lg pb-4 w-[30%] font-bold mb-4 border-b-2 border-blue-500">Follow Us</h3>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 duration-300"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 duration-300"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-400 duration-300"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-500 duration-300"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="text-black">
            <h3 className="text-lg font-bold pb-4 w-[30%] mb-4 border-b-2 border-blue-500">Newsletter</h3>
            <p className="text-sm mb-4">
              Subscribe to our newsletter to get the latest updates.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="p-2 mr-2 rounded-md border-1 border-gray-300  text-gray-500 focus:outline-none text-sm"
              />
              <button
                type="submit"
                className="bg-blue-100 text-blue-500 px-4 rounded-md hover:bg-blue-500 hover:text-white duration-300 cursor-pointer"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-300 text-gray-600 mt-8 pt-8 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Sazzad Mahim. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
