"""
Script to populate the database with demo templates.
"""

import asyncio
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.template import Template

DEMO_TEMPLATES = [
    {
        "name": "Fitness Motivation Monday",
        "description": "High-energy motivational caption for Monday fitness content",
        "caption": "💪 Monday Motivation Alert! 🚨 Time to crush those fitness goals! Remember, every rep counts, every step matters. You didn't come this far to only come this far! 🔥✨ What's your workout goal for today? Drop it in the comments! 👇",
        "hashtags": ["#MondayMotivation", "#FitnessGoals", "#WorkoutMotivation", "#GymLife", "#FitnessCommunity", "#StrengthTraining", "#HealthyLifestyle", "#FitnessJourney"],
        "niche": "fitness",
        "tone": "motivational",
        "platforms": ["instagram", "tiktok", "facebook"],
        "tags": ["monday", "motivation", "workout", "goals"],
        "category": "motivation",
        "is_public": True
    },
    {
        "name": "Food Recipe Hook",
        "description": "Engaging hook for recipe videos that builds curiosity",
        "caption": "🤫 The secret ingredient that changes EVERYTHING! You won't believe how simple this hack is... I've been gatekeeping this recipe for way too long! Who wants to know the secret? 👀✨ Save this for later and follow for more kitchen hacks! 📌",
        "hashtags": ["#RecipeSecret", "#CookingHack", "#FoodTok", "#KitchenTips", "#RecipeReveal", "#CookingSecrets", "#FoodHacks", "#HomeCooking"],
        "niche": "food",
        "tone": "fun",
        "platforms": ["tiktok", "instagram", "youtube_shorts"],
        "tags": ["recipe", "secret", "hook", "cooking"],
        "category": "hook",
        "is_public": True
    },
    {
        "name": "Business Growth Tip",
        "description": "Professional business tip sharing template",
        "caption": "📈 Business Growth Tip #47: Focus on retention over acquisition. It costs 5x more to acquire a new customer than to keep an existing one. Here's how I increased customer retention by 40% this quarter... 🧵 Thread below 👇",
        "hashtags": ["#BusinessTips", "#EntrepreneurLife", "#GrowthHacking", "#CustomerRetention", "#BusinessStrategy", "#SmallBusiness", "#BusinessGrowth", "#MarketingTips"],
        "niche": "business",
        "tone": "professional",
        "platforms": ["linkedin", "twitter", "instagram"],
        "tags": ["business", "growth", "tips", "strategy"],
        "category": "education",
        "is_public": True
    },
    {
        "name": "Lifestyle Morning Routine",
        "description": "Aesthetic morning routine content template",
        "caption": "✨ 5AM Morning Routine for a Productive Day ✨ This routine literally changed my life! Here's exactly what I do every morning to set myself up for success... Swipe to see each step! Which part of my routine resonates with you most? 💭",
        "hashtags": ["#MorningRoutine", "#5AMClub", "#ProductiveDay", "#LifestyleTips", "#Mindfulness", "#SelfCare", "#HealthyHabits", "#LifestyleBlogger"],
        "niche": "lifestyle",
        "tone": "casual",
        "platforms": ["instagram", "pinterest", "tiktok"],
        "tags": ["morning", "routine", "lifestyle", "productivity"],
        "category": "lifestyle",
        "is_public": True
    },
    {
        "name": "Tech Tool Review",
        "description": "Honest tech product review template",
        "caption": "🚀 Honest Review: [Tool Name] after 30 days... I tested this tool for a full month so you don't have to. Here's what I discovered: ✅ Pros: [List benefits] ❌ Cons: [List drawbacks] 💰 Worth it? [Final verdict] Full review in bio! What tech tools are you curious about?",
        "hashtags": ["#TechReview", "#ProductReview", "#TechTools", "#SoftwareReview", "#TechTips", "#ProductivityTools", "#TechTalk", "#DigitalTools"],
        "niche": "tech",
        "tone": "professional",
        "platforms": ["youtube", "linkedin", "twitter"],
        "tags": ["tech", "review", "tools", "software"],
        "category": "review",
        "is_public": True
    },
    {
        "name": "Educational How-To",
        "description": "Step-by-step educational content template",
        "caption": "📚 How to [Skill/Topic] in 5 Simple Steps! I wish someone taught me this earlier... it would have saved me months of confusion! Here's the exact process I use: Step 1: [First step] Step 2: [Second step] [Continue...] Save this post for later! 📌 Which step do you find most challenging?",
        "hashtags": ["#HowTo", "#Tutorial", "#LearnSomethingNew", "#SkillBuilding", "#Education", "#StepByStep", "#LearningTips", "#KnowledgeSharing"],
        "niche": "education",
        "tone": "educational",
        "platforms": ["youtube", "instagram", "linkedin"],
        "tags": ["how-to", "tutorial", "education", "learning"],
        "category": "tutorial",
        "is_public": True
    },
    {
        "name": "Travel Destination Showcase",
        "description": "Inspiring travel destination content",
        "caption": "🌍 POV: You discover the most underrated destination in [Country]! This place is giving main character energy and I'm here for it! 📍 Location: [Place Name] 💸 Budget: $[Amount] per day ⏰ Best time to visit: [Season] Who's adding this to their travel bucket list? ✈️✨",
        "hashtags": ["#TravelGram", "#Wanderlust", "#TravelTips", "#BucketList", "#TravelDestination", "#ExploreMore", "#TravelAddict", "#HiddenGems"],
        "niche": "travel",
        "tone": "fun",
        "platforms": ["instagram", "tiktok", "pinterest"],
        "tags": ["travel", "destination", "wanderlust", "adventure"],
        "category": "showcase",
        "is_public": True
    },
    {
        "name": "Behind The Scenes",
        "description": "Authentic behind-the-scenes content template",
        "caption": "🎬 Behind the scenes of creating content... Plot twist: it's not always glamorous! 😅 Here's what really goes into making [type of content]: • 47 takes to get the lighting right • Coffee addiction level: MAXIMUM • That moment when everything goes wrong but you roll with it ✨ What BTS moments do you want to see?",
        "hashtags": ["#BehindTheScenes", "#ContentCreator", "#RealLife", "#ContentCreation", "#CreativeProcess", "#Authentic", "#CreatorLife", "#BTS"],
        "niche": "lifestyle",
        "tone": "casual",
        "platforms": ["instagram", "tiktok", "youtube"],
        "tags": ["bts", "authentic", "creator", "real"],
        "category": "authentic",
        "is_public": True
    },
    {
        "name": "Question Engagement",
        "description": "High-engagement question post template",
        "caption": "🤔 Unpopular opinion time... [Your opinion/hot take] I know this might be controversial, but hear me out... [Explanation of your viewpoint] What's your take? Am I completely wrong or do you see my point? Let's discuss in the comments! 👇 (Respectful debate only please! 💙)",
        "hashtags": ["#UnpopularOpinion", "#LetsTalk", "#OpenDiscussion", "#PerspectiveSharing", "#ThoughtProvoking", "#Community", "#ConversationStarter", "#Debate"],
        "niche": "lifestyle",
        "tone": "conversational",
        "platforms": ["instagram", "twitter", "facebook"],
        "tags": ["opinion", "discussion", "engagement", "conversation"],
        "category": "engagement",
        "is_public": True
    },
    {
        "name": "Achievement Celebration",
        "description": "Milestone and achievement sharing template",
        "caption": "🎉 WE DID IT! [Achievement/milestone] I'm literally crying happy tears right now! 😭✨ When I started [journey/goal], I never imagined... [Share your journey] This wouldn't be possible without each one of you! Thank you for being part of this incredible journey! 💙 What's a recent win you're celebrating? Share below! 👇",
        "hashtags": ["#Milestone", "#Grateful", "#CommunityLove", "#Achievement", "#DreamsComeTrue", "#ThankYou", "#Celebration", "#Journey"],
        "niche": "lifestyle",
        "tone": "grateful",
        "platforms": ["instagram", "facebook", "linkedin"],
        "tags": ["milestone", "achievement", "grateful", "celebration"],
        "category": "celebration",
        "is_public": True
    }
]


def populate_templates():
    """Populate database with demo templates."""
    print("🌱 Populating database with demo templates...")
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Check if templates already exist
        existing_count = db.query(Template).filter(Template.is_public == True).count()
        
        if existing_count > 0:
            print(f"✅ Found {existing_count} existing public templates. Skipping population.")
            return
        
        # Create templates
        created_count = 0
        for template_data in DEMO_TEMPLATES:
            template = Template(**template_data)
            db.add(template)
            created_count += 1
        
        # Commit all templates
        db.commit()
        print(f"✅ Successfully created {created_count} demo templates!")
        
        # Print summary
        total_templates = db.query(Template).count()
        public_templates = db.query(Template).filter(Template.is_public == True).count()
        
        print(f"📊 Template Statistics:")
        print(f"   Total templates: {total_templates}")
        print(f"   Public templates: {public_templates}")
        print(f"   Private templates: {total_templates - public_templates}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error populating templates: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    populate_templates() 