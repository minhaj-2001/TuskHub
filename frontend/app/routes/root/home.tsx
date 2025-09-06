import React from "react";
import type { Route } from "../../+types/root";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Wrench, BarChart3, Users, CheckCircle, ArrowRight, Star, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TaskHub - Project Management Made Simple" },
    { name: "description", content: "Streamline your project management with TaskHub. Create, manage, and track projects with ease. Invite team members and collaborate effectively." },
  ];
}

const Homepage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Project Dashboard",
      description: "Get a comprehensive overview of all your projects with intuitive dashboards and real-time analytics.",
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Team Collaboration",
      description: "Invite team members and collaborate effectively with role-based access control and permissions.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-purple-600" />,
      title: "Progress Tracking",
      description: "Track project stages and milestones with visual progress indicators and completion tracking.",
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with user authentication and data protection for your projects.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Fast & Efficient",
      description: "Lightning-fast performance with a responsive interface that works seamlessly across devices.",
    },
    {
      icon: <Star className="h-8 w-8 text-indigo-600" />,
      title: "Export & Share",
      description: "Export project details as PDF and share with stakeholders for better communication.",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Sign Up as Manager",
      description: "Create your manager account and set up your project workspace.",
    },
    {
      step: "2",
      title: "Create Projects",
      description: "Create unlimited projects with custom stages and track their progress.",
    },
    {
      step: "3",
      title: "Invite Team Members",
      description: "Generate invite links for team members to join your projects with limited access.",
    },
    {
      step: "4",
      title: "Track & Manage",
      description: "Monitor progress and export reports to keep everyone aligned.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <Wrench className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">TaskHub</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/sign-in">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Button>
          </Link>
          <Link to="/sign-up">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Project Management <span className="text-blue-600">Simplified</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Streamline your projects with TaskHub - the intuitive platform that helps managers create, 
              track, and collaborate on projects while providing team members with the perfect view of progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/sign-up">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/sign-in">
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="space-y-6">
                {/* Dashboard Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Project Overview</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-100 rounded p-3 text-center">
                      <div className="text-2xl font-bold text-blue-700">12</div>
                      <div className="text-xs text-blue-600">Total Projects</div>
                    </div>
                    <div className="bg-green-100 rounded p-3 text-center">
                      <div className="text-2xl font-bold text-green-700">8</div>
                      <div className="text-xs text-green-600">Completed</div>
                    </div>
                    <div className="bg-yellow-100 rounded p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-700">4</div>
                      <div className="text-xs text-yellow-600">In Progress</div>
                    </div>
                  </div>
                </div>
                
                {/* Project List Preview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-gray-800">Website Redesign</div>
                        <div className="text-xs text-gray-500">Due: Dec 15, 2023</div>
                      </div>
                    </div>
                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Ongoing</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-gray-800">Mobile App Launch</div>
                        <div className="text-xs text-gray-500">Due: Nov 30, 2023</div>
                      </div>
                    </div>
                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-gray-800">Marketing Campaign</div>
                        <div className="text-xs text-gray-500">Due: Jan 10, 2024</div>
                      </div>
                    </div>
                    <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Planning</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-50"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-indigo-200 rounded-full opacity-50"></div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How TaskHub Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes and transform the way your team manages projects with our simple 4-step process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to make project management simple and effective for teams of all sizes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Perfect for Teams</h2>
              <p className="text-lg text-gray-600 mb-8">
                TaskHub is designed with role-based access control, ensuring everyone on your team has the right level of access to contribute effectively.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">For Managers</h3>
                    <p className="text-gray-600">Create projects, manage stages, invite team members, and export detailed reports.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">For Team Members</h3>
                    <p className="text-gray-600">View project progress, track milestones, and stay updated with limited access permissions.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Manager Dashboard</h3>
                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Full Access</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Create and edit projects</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Manage project stages</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Invite team members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Export project reports</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Team Member View</h3>
                    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Limited Access</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">View assigned projects</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Track project progress</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded border border-gray-300"></div>
                      <span className="text-sm text-gray-400">Cannot modify projects</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 rounded border border-gray-300"></div>
                      <span className="text-sm text-gray-400">Cannot invite users</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Project Management?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams already using TaskHub to streamline their projects and boost productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/sign-in">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Wrench className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">TaskHub</span>
              </div>
              <p className="text-gray-400">
                Project management simplified for teams of all sizes.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white">Features</Link></li>
                <li><Link to="#" className="hover:text-white">Pricing</Link></li>
                <li><Link to="#" className="hover:text-white">Integrations</Link></li>
                <li><Link to="#" className="hover:text-white">Updates</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white">About</Link></li>
                <li><Link to="#" className="hover:text-white">Blog</Link></li>
                <li><Link to="#" className="hover:text-white">Careers</Link></li>
                <li><Link to="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white">Documentation</Link></li>
                <li><Link to="#" className="hover:text-white">Community</Link></li>
                <li><Link to="#" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TaskHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;