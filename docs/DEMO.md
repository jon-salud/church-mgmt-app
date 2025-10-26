# Church Management App - Demo Guide

Welcome to the Church Management App demo! This guide will help you explore all the features and
understand how the application works.

## 🚀 Quick Start

1. **Access the Demo**: Visit <http://localhost:3000> in your browser
2. **Demo Login**: Click "Explore demo mode" on the login page to access with admin privileges
3. **Explore Freely**: All features work with realistic mock data

> **Note:** The demo uses an existing administrator account that has already completed the onboarding process. New administrators would see an onboarding modal wizard on their first login to set up church branding, roles, and initial team members.

## 📊 Dashboard Overview

The main dashboard provides a comprehensive overview of your church:

- **Church Statistics**: Total members, active groups, upcoming events
- **Recent Activity**: Latest announcements, prayer requests, and events
- **Quick Actions**: Fast access to common tasks
- **Navigation**: Easy access to all app sections

## 👥 Member Management

### Member Directory

- **Browse Members**: View all church members with contact information
- **Search & Filter**: Find members by name, group, or role
- **Member Details**: Click any member to see their full profile
- **Add New Members**: Create new member records with household information

### Household Management

- **Family Groups**: Link family members together
- **Guardian Relationships**: Support multiple guardians for children
- **Address Management**: Centralized household addresses

## 👨‍👩‍👧‍👦 Groups & Ministries

### Group Types

- **Geographical Ministries**: Location-based groups
- **Service Ministries**: Volunteer and service teams
- **Volunteer Teams**: Short-term project groups
- **Small Groups**: Community and fellowship groups

### Group Features

- **Membership Management**: Add/remove members with roles
- **Group Leaders**: Assign leadership positions
- **Meeting Schedules**: Track group activities
- **Communication**: Group-specific announcements

## 📅 Events & Attendance

### Event Management

- **Create Events**: Schedule church events with details
- **Event Types**: Services, meetings, classes, social events
- **Group Association**: Link events to specific ministries
- **Public/Private**: Control event visibility

### Attendance Tracking

- **Check-in System**: Mark attendance for events
- **Reporting**: View attendance statistics and trends
- **Export Data**: Download attendance reports as CSV

## 📢 Announcements

### Announcement System

- **Create Announcements**: Post church-wide communications
- **Rich Content**: Support for formatted text and links
- **Read Tracking**: See who has read announcements
- **Categories**: Organize announcements by type

### Features

- **Priority Levels**: Mark important announcements
- **Expiration Dates**: Set when announcements should be removed
- **Target Groups**: Send to specific ministries or all members

## 🙏 Pastoral Care & Prayer

### Prayer Wall

- **Public Requests**: Members can submit prayer requests
- **Moderation**: Staff can approve/reject requests
- **Anonymous Option**: Submit requests anonymously
- **Categories**: Organize by type (healing, guidance, thanksgiving)

### Pastoral Care Tickets

- **Confidential Support**: Private tickets for sensitive matters
- **Staff Assignment**: Route to appropriate pastoral staff
- **Progress Tracking**: Follow up on care needs
- **Secure Communication**: Threaded conversations

## 👶 Child Check-In System

### Safety Features

- **Household Verification**: Ensure authorized pickup
- **Guardian Check-in**: Multiple guardians per child
- **Time Tracking**: Monitor check-in/check-out times
- **Emergency Contacts**: Quick access to emergency information

### Check-in Process

1. **Family Arrival**: Guardian checks in with household
2. **Child Selection**: Choose which children are attending
3. **Room Assignment**: Assign children to appropriate rooms
4. **Check-out**: Secure checkout process with verification

## 💰 Giving & Financial Records

### Contribution Tracking

- **Manual Entry**: Record donations and contributions
- **Fund Management**: Organize giving by purpose
- **Tax Records**: Generate contribution statements
- **Reporting**: Financial summaries and trends

### Fund Types

- **General Fund**: Regular church operations
- **Building Fund**: Capital improvements
- **Missions**: Outreach and missions support
- **Benevolence**: Help for those in need

## ⚙️ Settings & Administration

### Church Settings

- **Basic Information**: Church name, address, contact details
- **Request Types**: Customize pastoral care categories
- **User Roles**: Define permission levels
- **System Configuration**: App behavior settings

### User Management

- **Role Assignment**: Admin, Staff, Member permissions
- **Access Control**: Feature-specific permissions
- **Audit Logs**: Track system changes and access

### Archive & Recovery

- **Soft Delete**: Records are archived instead of permanently deleted
- **Admin Recovery**: Administrators can restore archived items
- **Data Integrity**: Preserves relationships and prevents accidental data loss
- **Audit Trail**: All archive/recovery actions are logged

**Try It**: Go to Members → Archive tab to see archived records, or Settings → Roles → Archive to recover deleted roles.

## 🔧 Technical Features

### Progressive Web App (PWA)

- **Offline Support**: Works without internet connection
- **Installable**: Add to home screen on mobile devices
- **Push Notifications**: Stay updated with church news
- **Fast Loading**: Cached for quick access

### Responsive Design

- **Mobile First**: Optimized for phones and tablets
- **Desktop Support**: Full functionality on computers
- **Touch Friendly**: Easy navigation on touch devices
- **Accessibility**: Screen reader and keyboard support

## 📱 API Documentation

For developers interested in the technical implementation:

- **API Docs**: Visit <http://localhost:3001/docs>
- **Swagger UI**: Interactive API testing interface
- **OpenAPI Spec**: Complete API documentation
- **Mock Data**: All endpoints work with realistic test data

## 🎯 Demo Tips

### Best Practices

- **Explore Navigation**: Use the sidebar to discover all features
- **Try Different Roles**: Switch between admin and member views
- **Test Workflows**: Create events, add members, track attendance
- **Check Mobile**: Resize browser to see responsive design

### Sample Data

The demo includes realistic sample data:

- 50+ church members across multiple households
- 10+ active groups and ministries
- Upcoming events and services
- Recent announcements and prayer requests
- Complete financial contribution history

### Getting Help

- **Dashboard**: Start here for an overview
- **Navigation**: Sidebar provides access to all sections
- **Search**: Use search boxes to find specific items
- **Help Icons**: Look for info icons on complex forms

## 🚀 Next Steps

After exploring the demo, you might want to:

1. **Deploy Your Own**: Set up the app for your church
2. **Customize**: Modify colors, branding, and features
3. **Integrate**: Connect to your existing systems
4. **Train Staff**: Use this demo for staff training

## 📞 Support

This demo showcases a complete church management solution with:

- ✅ Modern web technology (Next.js, React, TypeScript)
- ✅ Professional UI/UX design
- ✅ Comprehensive feature set
- ✅ Scalable architecture
- ✅ Security and privacy focus
- ✅ Mobile and offline support

Enjoy exploring your church management application! 🏛️✨

---

## Change Records

### v1.0.0 - Soft Delete Demo

- **Date**: 2024-12-19
- **Changes**:
  - Added Archive & Recovery section to Settings & Administration
  - Documented soft delete behavior and admin recovery features
  - Added demo instructions for testing archive/recovery functionality
