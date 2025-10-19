/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';

const MeetTheTeam = () => {
  const teamMembers = [
    {
      name: 'Bhavyam Arora',
      designation: 'Marketing Manager',
      photo: 'https://media.licdn.com/dms/image/v2/D5603AQFzJpt7gIFJsw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1716205097663?e=1762992000&v=beta&t=gS3n0iTe_RGsRMASQbR_jcNxqruT_L_VMKvvvBok_zA',
      linkedin: 'https://linkedin.com/in/bhavyam-arora',
      twitter: 'https://twitter.com/bhavyam_arora'
    },
    {
      name: 'Prajval Bhardwaj',
      designation: 'Blockchain Architect',
      photo: 'https://media.licdn.com/dms/image/v2/D5603AQFsaIFMKbk5xQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1722439860034?e=1762992000&v=beta&t=oujF50L4y5A5nNCCQJoux045EAqeBsAqqCMBQjUtIOY',
      linkedin: 'https://linkedin.com/in/prajval-bhardwaj',
      twitter: 'https://twitter.com/prajval_bhardwaj'
    },
    {
      name: 'Rahul Mittal',
      designation: 'Frontend Specialist',
      photo: 'https://media.licdn.com/dms/image/v2/D5635AQFVwPk8zFDWAQ/profile-framedphoto-shrink_200_200/profile-framedphoto-shrink_200_200/0/1716314610243?e=1760932800&v=beta&t=sOsPX1TIOx1YAOGPQm2Zism2m5P4yLOcABHDymsqccQ',
      linkedin: 'https://linkedin.com/in/rahul-mittal',
      twitter: 'https://twitter.com/rahul_mittal'
    },
    {
      name: 'Kshitij Garg',
      designation: 'Smart Contract Developer',
      photo: 'https://media.licdn.com/dms/image/v2/D5603AQGDUYxcfMNMRw/profile-displayphoto-shrink_200_200/B56ZUd4eeAGUAY-/0/1739963100027?e=1762992000&v=beta&t=sBOtvK7b4kCWNgbVAVRVa1hLHYwFL7Nz4R2jf0jKNpM',
      linkedin: 'https://linkedin.com/in/kshitij-garg',
      twitter: 'https://twitter.com/kshitij_garg'
    },
    {
      name: 'Jnyandeep Singh',
      designation: 'ZK Smart Contract Developer',
      photo: 'https://media.licdn.com/dms/image/v2/D5603AQGboKND2dr3kQ/profile-displayphoto-shrink_200_200/B56ZUhl6IIGQAY-/0/1740025343859?e=1762992000&v=beta&t=wEZmm0LKZFmrLipxV5SvpgeDqvTuqniqGONmENcA1O4',
      linkedin: 'https://linkedin.com/in/jynayndeep-singh',
      twitter: 'https://twitter.com/jynayndeep_singh'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Section Header */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-3xl sm:text-4xl font-medium mb-4" style={{ color: '#201515' }}>
              Meet the Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The brilliant minds behind Zap3Flow. We're passionate about building 
              the future of Web3 automation.
            </p>
          </motion.div>

          {/* Team Grid */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8"
            variants={containerVariants}
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="group"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-lg">
                  {/* Photo */}
                  <div className="relative mb-4">
                    <motion.img
                      src={member.photo}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-gray-100 group-hover:border-[#FF4A00] transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-gray-900 text-center mb-1">
                    {member.name}
                  </h3>

                  {/* Designation */}
                  <p className="text-sm text-gray-600 text-center mb-4">
                    {member.designation}
                  </p>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-3">
                    {/* LinkedIn */}
                    <motion.a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-transparent border border-gray-300 rounded-lg flex items-center justify-center hover:border-[#0077B5] hover:bg-blue-50 transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </motion.a>

                    {/* X (Twitter) */}
                    <motion.a
                      href={member.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-transparent border border-gray-300 rounded-lg flex items-center justify-center hover:border-black hover:bg-gray-50 transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div 
            className="text-center mt-12"
            variants={itemVariants}
          >
            <motion.p 
              className="text-gray-600 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Want to join our team? We're always looking for talented individuals.
            </motion.p>
            <motion.a
              href="#contact"
              className="inline-flex items-center bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              View Open Positions
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 to-transparent pointer-events-none" />
    </section>
  );
};

export default MeetTheTeam;
