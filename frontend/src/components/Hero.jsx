import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, CheckCircle } from 'lucide-react';
import { handleApplyAsTutor } from '../utils/authHelper';
import { submitContactForm } from '../services/contactService';
import quietZonesImg from '../assets/quiet zones.jpeg';
import collaborativeTablesImg from '../assets/photogood.jpeg';
import individualPodsImg from '../assets/individual.jpeg';
import premiumTuitionImg from '../assets/individual.jpeg';
import premiumGroupImg from '../assets/WhatsApp Image 2026-02-12 at 4.41.12 PM.jpeg';

const Hero = () => {
  const navigate = useNavigate();
  const sliderImages = [
    { src: '/photogood.jpeg', position: 'center' },
    { src: '/photogood1.jpeg', position: 'center' },
    { src: '/photogood2.jpeg', position: 'center' },
    { src: '/photogood3.jpeg', position: 'top' },
    { src: individualPodsImg, position: 'center' },
    { src: premiumTuitionImg, position: 'center' },
    { src: premiumGroupImg, position: 'center' }
  ];
  const missionCards = [
    {
      title: 'Quiet Zones',
      img: quietZonesImg,
      glowClass: 'from-cyan-500/35 via-blue-500/20 to-transparent'
    },
    {
      title: 'Collaborative Tables',
      img: collaborativeTablesImg,
      glowClass: 'from-violet-500/35 via-fuchsia-500/20 to-transparent'
    },
    {
      title: 'Individual Pods',
      img: individualPodsImg,
      glowClass: 'from-emerald-500/35 via-teal-500/20 to-transparent'
    }
  ];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [activePolicy, setActivePolicy] = useState(null);

  const policyContent = {
    privacy: {
      title: 'Privacy Policy',
      body: [
        'We collect only the information needed to provide tutoring services and respond to inquiries.',
        'Your contact details are used to communicate about classes, schedules, and support.',
        'We do not sell your personal information to third parties.'
      ]
    },
    terms: {
      title: 'Terms of Service',
      body: [
        'By using our platform, you agree to provide accurate information and follow our community guidelines.',
        'Tutoring sessions are subject to availability and scheduling confirmation.',
        'We may update services or policies to improve quality and compliance.'
      ]
    },
    cookies: {
      title: 'Cookie Policy',
      body: [
        'We use cookies to remember your preferences and improve site performance.',
        'You can control or delete cookies through your browser settings.',
        'Disabling cookies may affect some features of the website.'
      ]
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [sliderImages.length]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await submitContactForm(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#05070a] text-white selection:bg-blue-500/30">
      <style>{`
        @keyframes heroBorderShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20">
        {/* Animated Background Glows */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 w-full max-w-6xl"
        >
          <h1 className="mx-auto max-w-6xl pb-3 text-[clamp(2.9rem,6vw,5.6rem)] font-extrabold tracking-[-0.04em] leading-[1.04] mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            <span className="block sm:hidden">Connect with the <span className="text-blue-500">best tutors</span> in your area</span>
            <span className="hidden sm:block lg:hidden">Connecting students with <span className="text-blue-500">top home tutors</span> near you</span>
            <span className="hidden lg:block">Connecting students with the <br/><span className="text-blue-500">best home tutors</span> in your area</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-10 sm:mb-12 px-2">
            Choose a trusted tutor for your learning needs or start earning as a home tutor today.
          </p>

          <div className="grid w-full max-w-4xl mx-auto gap-4 sm:gap-6 md:grid-cols-2">
            <motion.div whileHover={{ y: -5 }} className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Find the right tutor</h3>
              <button 
                onClick={() => navigate("/find-tutor")}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20"
              >
                Find Tutor
              </button>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-pink-500/20 backdrop-blur-xl">
              <h3 className="text-xl sm:text-2xl font-bold mb-4">Become a home tutor</h3>
              <button
                type="button"
                onClick={async () => {
                  await handleApplyAsTutor(navigate);
                }}
                className="w-full py-4 bg-pink-600 hover:bg-pink-700 rounded-xl font-semibold transition-all shadow-lg shadow-pink-600/20"
              >
                Apply as Tutor
              </button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: ABOUT MISSION */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div {...fadeIn} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Goodwill Ready & Mission</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">Providing quiet spaces for focused reading and connecting the brightest minds through personalized tutoring.</p>
        </motion.div>

        <div className="grid gap-8 sm:gap-10 md:grid-cols-2 xl:grid-cols-3">
          {missionCards.map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -8 }}
              className="group text-center max-w-sm mx-auto w-full"
            >
              <div className="relative mb-6">
                <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${item.glowClass} blur-2xl opacity-80 transition-opacity duration-500 group-hover:opacity-100`} />
                <div
                  className="relative aspect-square overflow-hidden rounded-[2rem] p-[2px] shadow-2xl transition-transform duration-500 group-hover:-rotate-1"
                  style={{
                    backgroundImage:
                      'linear-gradient(120deg, rgba(34,211,238,0.95), rgba(96,165,250,0.95), rgba(168,85,247,0.95), rgba(16,185,129,0.95), rgba(34,211,238,0.95))',
                    backgroundSize: '300% 300%',
                    animation: 'heroBorderShift 6s ease-in-out infinite'
                  }}
                >
                  <div className="h-full w-full rounded-[1.9rem] bg-[#08111d] p-2">
                    <img src={item.img} alt={item.title} className="h-full w-full rounded-[1.4rem] object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
                  </div>
                </div>
              </div>
              <h4 className="text-2xl sm:text-3xl font-bold">{item.title}</h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 3: ABOUT HOME TUTOR */}
      <section className="py-24 bg-blue-600/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeIn}>
            <h2 className="text-4xl font-bold mb-6 italic">Premium Home Tuition</h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              We bridge the gap between quality education and accessibility. Our platform ensures that every student gets the undivided attention they deserve in the comfort of their home.
            </p>
            <div className="space-y-4">
              {['Verified Subject Experts', 'Flexible Schedules', 'Regular Progress Tracking'].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="text-blue-500" size={20} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...fadeIn} className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
            <div className="relative z-10 rounded-3xl border border-white/10 shadow-2xl overflow-hidden aspect-[4/3] w-full max-w-xl mx-auto">
              <motion.img
                key={sliderImages[activeSlide].src}
                src={sliderImages[activeSlide].src}
                alt="Home tuition"
                className="w-full h-full object-cover"
                style={{ objectPosition: sliderImages[activeSlide].position }}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: GET IN TOUCH & MAP */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden grid md:grid-cols-2">
          <div className="p-12">
            <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
            
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-300">
                ✅ Your message has been sent successfully! We'll get back to you soon.
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
                ❌ {error}
              </div>
            )}
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <input 
                type="text" 
                placeholder="Full Name *" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:ring-2 ring-blue-500 outline-none transition-all text-white placeholder-gray-400 disabled:opacity-50" 
              />
              <input 
                type="email" 
                placeholder="Email Address *" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:ring-2 ring-blue-500 outline-none transition-all text-white placeholder-gray-400 disabled:opacity-50" 
              />
              <textarea 
                placeholder="Your Message *" 
                rows="4" 
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:ring-2 ring-blue-500 outline-none transition-all text-white placeholder-gray-400 disabled:opacity-50 resize-none"
              ></textarea>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
          
          <div className="relative min-h-[400px] bg-gray-900">
            {/* Real Google Map Integration - GW Tutor Bhopal Location */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3667.8325432673!2d77.4129!3d23.2599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c428f8e7e6e9b%3A0x5c8b9c8b9c8b9c8b!2sNeerja+Nagar%2C+Durgesh+Vihar+JK+Road%2C+Bhopal%2C+Madhya+Pradesh+462022!5e0!3m2!1sen!2sin!4v1634567890123!5m2!1sen!2sin" 
              className="absolute inset-0 w-full h-full grayscale invert opacity-50"
              style={{ border: 0 }}
              allowFullScreen="" 
              loading="lazy"
            ></iframe>
            <div className="absolute bottom-8 left-8 p-6 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="flex items-center gap-3 mb-2"><MapPin size={18} className="text-blue-500" /> <span>Neerja Nagar, Durgesh Vihar JK Road, Bhopal</span></div>
              <div className="flex items-center gap-3 mb-2"><Phone size={18} className="text-blue-500" /> <span>+91 9691569239</span></div>
              <div className="flex items-center gap-3"><Mail size={18} className="text-blue-500" /> <span>goodwill2404@gmail.com</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFESSIONAL FOOTER */}
      <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-t border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-bold text-white">Goodwill Group of Education</h3>
              </div>
              <p className="text-gray-400 mb-4 leading-relaxed">
                Empowering students with quality education and personalized learning experiences. 
                Your trusted partner in academic excellence and career development.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/gv.library.as_/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.facebook.com/amit.sahu.71513#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://wa.me/919691569239" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 shadow-lg"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">Home</a></li>
                <li><a href="/about" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">About Us</a></li>
                <li><a href="/library" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">Library</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">Contact</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-4">Contact Info</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-gray-400 text-sm">goodwill2404@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="text-gray-400 text-sm">+91 9691569239</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-400 text-sm">Bhopal, Madhya Pradesh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <p className="text-gray-400 text-sm text-center md:text-left">
                &copy; 2026 Goodwill Group of Education. All rights reserved.
              </p>
              <p className="text-gray-400 text-sm text-center">
                Designed & Developed by{" "}
                <a
                  href="https://shashankportfolio-omega.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 underline underline-offset-4"
                >
                  Shashank
                </a>
                .
              </p>
              <div className="flex items-center justify-center md:justify-end space-x-6">
                <button
                  type="button"
                  onClick={() => setActivePolicy('privacy')}
                  className="text-gray-400 hover:text-cyan-400 text-sm transition-colors duration-300"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => setActivePolicy('terms')}
                  className="text-gray-400 hover:text-cyan-400 text-sm transition-colors duration-300"
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  onClick={() => setActivePolicy('cookies')}
                  className="text-gray-400 hover:text-cyan-400 text-sm transition-colors duration-300"
                >
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/70 backdrop-blur-sm">
          <div className="max-w-xl w-full bg-gray-900 border border-white/10 rounded-2xl p-8 relative">
            <button
              type="button"
              onClick={() => setActivePolicy(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close policy"
            >
              X
            </button>
            <h3 className="text-2xl font-bold mb-4">{policyContent[activePolicy].title}</h3>
            <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
              {policyContent[activePolicy].body.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hero;
