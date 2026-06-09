
import { Users, Image, Heart, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const About = () => {
  const stats = [
    { icon: Users, value: "2,500+", label: "Active Artists" },
    { icon: Image, value: "15,000+", label: "Artworks Sold" },
    { icon: Heart, value: "50,000+", label: "Happy Customers" },
    { icon: Award, value: "500+", label: "Awards Won" }
  ];

  const teamMembers = [
    {
      name: "Aditi Joshi",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b6e4b15f?w=300&h=300&fit=crop&crop=face",
      bio: "Former gallery curator with 15+ years in the art world, passionate about connecting artists with collectors."
    },
    {
      name: "Kartik Suryawanshi",
      role: "Head of Technology",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "Tech veteran who believes in using technology to democratize art and make it accessible to everyone."
    },
    {
      name: "Sophie Chen",
      role: "Head of Community",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      bio: "Artist advocate dedicated to building supportive communities and fostering creative connections."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      <Navbar />
      
      <div className="pt-20 px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-5xl font-bold text-stone-800 mb-6">About Pixora</h1>
            <p className="text-xl text-stone-600 max-w-4xl mx-auto leading-relaxed">
              We're on a mission to democratize the art world by creating a platform where creativity thrives, 
              artists prosper, and art lovers discover their next favorite piece. Since 2020, Pixora has been 
              the bridge between talented artists and passionate collectors worldwide.
            </p>
          </section>

          {/* Stats Section */}
          <section className="mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="flex justify-center mb-4">
                      <stat.icon className="w-12 h-12 text-stone-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-stone-800 mb-2">{stat.value}</h3>
                    <p className="text-stone-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Mission Section */}
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-stone-800 mb-6">Our Mission</h2>
                <p className="text-stone-600 text-lg mb-6 leading-relaxed">
                  We believe that art has the power to transform lives, spark conversations, and bring people together. 
                  Our platform is designed to empower artists at every stage of their journey while providing collectors 
                  with access to unique, authentic artworks.
                </p>
                <p className="text-stone-600 text-lg leading-relaxed">
                  From emerging artists selling their first piece to established creators expanding their reach, 
                  Pixora provides the tools, community, and marketplace needed to turn artistic passion into sustainable success.
                </p>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop"
                  alt="Art gallery"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-stone-800/20 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-center text-stone-800 mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0 text-center">
                  <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4">Authenticity</h3>
                  <p className="text-stone-600">
                    We celebrate original voices and unique perspectives, ensuring every piece on our platform 
                    represents genuine artistic expression.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0 text-center">
                  <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4">Community</h3>
                  <p className="text-stone-600">
                    We foster meaningful connections between artists and collectors, building a supportive 
                    ecosystem where creativity can flourish.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-0 text-center">
                  <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-4">Excellence</h3>
                  <p className="text-stone-600">
                    We maintain the highest standards in curation, user experience, and artist support, 
                    ensuring quality in every interaction.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-20">
            <h2 className="text-4xl font-bold text-center text-stone-800 mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-stone-800 mb-1">{member.name}</h3>
                    <p className="text-stone-600 font-medium mb-3">{member.role}</p>
                    <p className="text-stone-600 text-sm leading-relaxed">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-stone-800 to-slate-900 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-6">Join Our Creative Community</h2>
            <p className="text-xl text-stone-200 mb-8 max-w-2xl mx-auto">
              Whether you're an artist ready to share your work or a collector seeking your next inspiration, 
              Pixora is your gateway to the world of art.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup" className="inline-block">
                <button className="bg-white text-stone-800 hover:bg-stone-100 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
                  Start Your Journey
                </button>
              </a>
              <a href="/marketplace" className="inline-block">
                <button className="border-2 border-white text-white hover:bg-white hover:text-stone-800 px-8 py-3 rounded-full font-semibold transition-all duration-300">
                  Explore Artworks
                </button>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
