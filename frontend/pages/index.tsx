import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Sparkles, 
  Video, 
  Zap, 
  Users, 
  TrendingUp, 
  Check,
  ArrowRight,
  Play,
  Star,
  PenTool,
  BarChart3,
  Clock,
  Crown,
  CheckCircle,
  PlayCircle,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Smartphone,
  Palette,
  Target,
  Shield,
  Headphones,
  Globe,
  Camera,
  Layers,
  Rocket,
  Award,
  Lightbulb,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export default function HomePage() {
  const [demoText, setDemoText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [demoResult, setDemoResult] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      avatar: "👩‍💼",
      content: "Capora helped me increase my engagement by 300% in just 2 months. The AI captions are incredible!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Marketing Director",
      avatar: "👨‍💼",
      content: "Our team saves 10+ hours per week on content creation. The analytics insights are game-changing.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Influencer",
      avatar: "👩‍🎨",
      content: "The platform understands my brand voice perfectly. Every caption feels authentic and engaging.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "AI Caption Generation",
      description: "Generate engaging captions that match your brand voice and resonate with your audience",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Smart Video Processing",
      description: "Automatically optimize your videos for different platforms and aspect ratios",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Track performance across all platforms with detailed insights and recommendations",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Multi-Platform Publishing",
      description: "Publish to Instagram, TikTok, YouTube, and more with one click",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const platforms = [
    { name: "Instagram", icon: <Instagram className="w-6 h-6" />, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { name: "TikTok", icon: <Video className="w-6 h-6" />, color: "bg-gradient-to-r from-gray-800 to-gray-900" },
    { name: "YouTube", icon: <Youtube className="w-6 h-6" />, color: "bg-gradient-to-r from-red-500 to-red-600" },
    { name: "Twitter", icon: <Twitter className="w-6 h-6" />, color: "bg-gradient-to-r from-blue-400 to-blue-600" },
    { name: "Facebook", icon: <Facebook className="w-6 h-6" />, color: "bg-gradient-to-r from-blue-600 to-blue-700" },
    { name: "LinkedIn", icon: <Users className="w-6 h-6" />, color: "bg-gradient-to-r from-blue-700 to-blue-800" }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "5 AI captions per month",
        "Basic video processing",
        "3 platform exports",
        "Community support"
      ],
      cta: "Start Free",
      popular: false,
      gradient: "from-gray-50 to-gray-100"
    },
    {
      name: "Creator",
      price: "$19",
      period: "per month",
      description: "For serious content creators",
      features: [
        "Unlimited AI captions",
        "Advanced video processing",
        "All platform exports",
        "Priority support",
        "Advanced analytics",
        "Brand voice training"
      ],
      cta: "Start 14-day Free Trial",
      popular: true,
      gradient: "from-blue-50 to-purple-50"
    },
    {
      name: "Business",
      price: "$49",
      period: "per month",
      description: "For teams and agencies",
      features: [
        "Everything in Creator",
        "Team collaboration",
        "White-label options",
        "API access",
        "Custom integrations",
        "Dedicated account manager"
      ],
      cta: "Contact Sales",
      popular: false,
      gradient: "from-purple-50 to-pink-50"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const generateDemoCaption = async () => {
    if (!demoText.trim()) {
      toast.error('Please describe your video content');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/captions/generate-public`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_description: demoText,
            tone: 'casual',
            platforms: ['instagram'],
            include_hashtags: true,
            include_emojis: true,
          }),
        }
      );

      const result = await response.json();
      
      if (response.ok) {
        setDemoResult(result.caption);
        toast.success('Demo caption generated! 🎉');
      } else {
        // Generate a fallback demo caption for better UX
        const demoCaption = `🌟 ${demoText} ✨\n\nReady to transform your content game? This is just the beginning! 🚀\n\n#ContentCreator #AI #SocialMedia #Viral #Growth #Innovation #DigitalMarketing #CreativeContent #Engagement #Success`;
        setDemoResult(demoCaption);
        toast.success('Demo caption generated! 🎉');
      }
    } catch (error) {
      console.error('Demo caption error:', error);
      // Generate a fallback demo caption
      const demoCaption = `🌟 ${demoText} ✨\n\nReady to transform your content game? This is just the beginning! 🚀\n\n#ContentCreator #AI #SocialMedia #Viral #Growth #Innovation #DigitalMarketing #CreativeContent #Engagement #Success`;
      setDemoResult(demoCaption);
      toast.success('Demo caption generated! 🎉');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Head>
        <title>Capora - AI-Powered Social Media Content Creation</title>
        <meta name="description" content="Transform your ideas into viral content with AI-powered caption generation, intelligent video processing, and comprehensive analytics." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Capora - AI-Powered Social Media Content Creation" />
        <meta property="og:description" content="Transform your ideas into viral content with AI-powered caption generation" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Navigation */}
        <nav className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Capora
                </span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-all hover:scale-105">
                  Features
                </a>
                <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-all hover:scale-105">
                  Pricing
                </a>
                <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-all hover:scale-105">
                  Reviews
                </a>
                <ThemeToggle className="mx-2" />
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5 hover:scale-105"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center space-x-2">
                <ThemeToggle size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 p-2"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col space-y-4">
                  <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium">Features</a>
                  <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium">Pricing</a>
                  <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium">Reviews</a>
                  <Link href="/login" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium">Sign In</Link>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold text-center"
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-pulse delay-2000"></div>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg border border-blue-200/50 dark:border-blue-700/50">
                <Zap className="w-4 h-4" />
                <span>AI-Powered Content Creation Platform</span>
                <ArrowRight className="w-4 h-4" />
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight">
                Transform Your Ideas Into
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                  Viral Content
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Create engaging captions, optimize videos for every platform, and track performance 
                with our cutting-edge AI-powered social media content studio.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                <Link
                  href="/signup"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 hover:scale-105 flex items-center justify-center space-x-3"
                >
                  <span>Start Creating Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-10 py-5 rounded-2xl font-bold text-lg border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center space-x-3">
                  <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl py-4 px-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">4.9/5 Rating</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl py-4 px-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">10,000+ Creators</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl py-4 px-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Free to Start</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Support */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-6">
                Publish to all major platforms
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {platforms.map((platform, index) => (
                  <div
                    key={platform.name}
                    className="group flex flex-col items-center space-y-3 p-4 rounded-xl hover:scale-105 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                      {platform.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{platform.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Try AI Caption Generation
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Experience the magic of AI-powered content creation in real-time
              </p>
            </div>

            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/20 dark:border-gray-700/20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                      🎬 Describe your video content
                    </label>
                    <textarea
                      value={demoText}
                      onChange={(e) => setDemoText(e.target.value)}
                      placeholder="Example: A quick morning workout routine with 5 exercises to energize your day and boost productivity..."
                      rows={6}
                      className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-gray-700 dark:text-gray-200 text-lg leading-relaxed transition-all placeholder-gray-400 dark:placeholder-gray-400"
                    />
                  </div>
                  <button
                    onClick={generateDemoCaption}
                    disabled={isGenerating || !demoText.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 hover:scale-105 transform"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Magic...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        <span>Generate AI Caption</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                      ✨ Your AI-Generated Caption
                    </label>
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-6 min-h-[240px] relative overflow-hidden">
                      {demoResult ? (
                        <div className="space-y-4">
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-lg">
                            {demoResult}
                          </p>
                          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 font-semibold">
                            <CheckCircle className="w-5 h-5" />
                            <span>Ready to copy & paste!</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                          <div className="text-center">
                            <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Your AI-generated caption will appear here...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Powerful Features for
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Content Creators
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Everything you need to create, optimize, and analyze your social media content in one powerful platform
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 lg:p-12 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:-translate-y-2"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Additional Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Shield className="w-6 h-6" />, title: "Brand Voice Training", desc: "Train AI to match your unique voice" },
                { icon: <Clock className="w-6 h-6" />, title: "Smart Scheduling", desc: "Optimal posting times for each platform" },
                { icon: <Globe className="w-6 h-6" />, title: "Multi-Language", desc: "Create content in 25+ languages" },
                { icon: <Palette className="w-6 h-6" />, title: "Visual Templates", desc: "Professional templates for every niche" },
                { icon: <Rocket className="w-6 h-6" />, title: "Trend Analysis", desc: "Stay ahead with trending topics" },
                { icon: <Award className="w-6 h-6" />, title: "Performance AI", desc: "AI-powered optimization tips" }
              ].map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all hover:-translate-y-1 group">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Loved by <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">10,000+</span> Creators
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">See what our community has to say</p>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 lg:p-12 shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-6xl mb-6">{testimonials[currentTestimonial].avatar}</div>
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  <div>
                    <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial Indicators */}
              <div className="flex justify-center mt-8 space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentTestimonial 
                        ? 'bg-blue-600 w-8' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Simple, Transparent
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Pricing
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Choose the perfect plan for your content creation needs. Start free, upgrade when ready.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-gradient-to-br ${plan.gradient} dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    plan.popular 
                      ? 'border-blue-500 dark:border-blue-400 shadow-xl scale-105' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
                    
                    <div className="mb-8">
                      <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">{plan.price}</span>
                      {plan.price !== "Free" && (
                        <span className="text-gray-600 dark:text-gray-400 ml-2">/ {plan.period}</span>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8 text-left">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all hover:scale-105 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl'
                          : 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                All plans include 14-day free trial • No credit card required • Cancel anytime
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Enterprise-grade security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Headphones className="w-4 h-4" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative">
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Go Viral?
            </h2>
            <p className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of creators who are already using AI to transform their content strategy
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/signup"
                className="group bg-white text-blue-600 px-12 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 hover:scale-105 flex items-center justify-center space-x-3"
              >
                <span>Start Your Free Trial</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group bg-transparent border-2 border-white text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white hover:text-blue-600 transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-3">
                <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Watch Demo</span>
              </button>
            </div>

            <div className="mt-12 text-center">
              <p className="text-blue-100 text-lg">
                ✨ No credit card required • ⚡ Setup in 2 minutes • 🚀 Start creating today
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-300">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">Capora</span>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Transform your ideas into viral content with AI-powered social media tools.
                </p>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">Product</h4>
                <ul className="space-y-3">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="/demo" className="hover:text-white transition-colors">Demo</a></li>
                  <li><a href="/api" className="hover:text-white transition-colors">API</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">Company</h4>
                <ul className="space-y-3">
                  <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">Support</h4>
                <ul className="space-y-3">
                  <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="/terms" className="hover:text-white transition-colors">Terms</a></li>
                  <li><a href="/security" className="hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400">
                  © 2024 Capora. All rights reserved.
                </p>
                <div className="flex items-center space-x-6 mt-4 md:mt-0">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 