import {
  FaBriefcase,
  FaClipboardList,
  FaMoneyBillWave,
  FaUser,
  FaSearch,
  FaPlusCircle,
  FaUsers,
  FaChartBar,
  FaFlag,
} from "react-icons/fa";

export const dashboardContent = {

  freelancer: {

    hero: {
      title: "Ready to land your next project?",
      subtitle:
        "Complete your profile, create gigs and connect with clients worldwide.",
      primaryButton: "Create Gig",
      primaryRoute: "/freelancer/create-gig",
      secondaryButton: "Browse Projects",
      secondaryRoute: "/freelancer/projects",
    },

    stats: [
      {
        title: "My Gigs",
        value: "0",
        subtitle: "Active gigs",
        icon: FaBriefcase,
        color: "bg-blue-500",
      },

      {
        title: "Applications",
        value: "0",
        subtitle: "Sent",
        icon: FaClipboardList,
        color: "bg-green-500",
      },

      {
        title: "Earnings",
        value: "₹0",
        subtitle: "Total earned",
        icon: FaMoneyBillWave,
        color: "bg-purple-500",
      },

      {
        title: "Profile",
        value: "80%",
        subtitle: "Completed",
        icon: FaUser,
        color: "bg-orange-500",
      },
    ],

    quickActions: [
      {
        title: "Complete Profile",
        description: "Increase your chances of getting hired.",
        icon: FaUser,
        color: "bg-blue-500",
        route: "/profile",
      },

      {
        title: "Create Gig",
        description: "Start selling your skills.",
        icon: FaPlusCircle,
        color: "bg-green-500",
        route: "/freelancer/create-gig",
      },

      {
        title: "Browse Projects",
        description: "Apply for freelance work.",
        icon: FaSearch,
        color: "bg-purple-500",
        route: "/freelancer/projects",
      },
    ],
  },

  client: {

    hero: {
      title: "Find the perfect freelancer.",
      subtitle:
        "Post projects, review applications and hire top talent.",
      primaryButton: "Post Project",
      primaryRoute: "/client/post-project",
      secondaryButton: "Browse Freelancers",
      secondaryRoute: "/client/browse",
    },

    stats: [
      {
        title: "Projects",
        value: "0",
        subtitle: "Posted",
        icon: FaBriefcase,
        color: "bg-blue-500",
      },

      {
        title: "Applications",
        value: "0",
        subtitle: "Received",
        icon: FaClipboardList,
        color: "bg-green-500",
      },

      {
        title: "Freelancers",
        value: "0",
        subtitle: "Hired",
        icon: FaUsers,
        color: "bg-purple-500",
      },

      {
        title: "Spent",
        value: "₹0",
        subtitle: "Total",
        icon: FaMoneyBillWave,
        color: "bg-orange-500",
      },
    ],

    quickActions: [
      {
        title: "Post Project",
        description: "Create a new project.",
        icon: FaPlusCircle,
        color: "bg-blue-500",
        route: "/client/post-project",
      },

      {
        title: "Browse Freelancers",
        description: "Find the right talent.",
        icon: FaSearch,
        color: "bg-green-500",
        route: "/client/browse",
      },
    ],
  },

  admin: {

    hero: {
      title: "Platform Overview",
      subtitle:
        "Monitor users, projects and platform activity.",
      primaryButton: "Manage Users",
      primaryRoute: "/admin/users",
      secondaryButton: "Analytics",
      secondaryRoute: "/admin/analytics",
    },

    stats: [
      {
        title: "Users",
        value: "0",
        subtitle: "Registered",
        icon: FaUsers,
        color: "bg-blue-500",
      },

      {
        title: "Projects",
        value: "0",
        subtitle: "Running",
        icon: FaBriefcase,
        color: "bg-green-500",
      },

      {
        title: "Reports",
        value: "0",
        subtitle: "Pending",
        icon: FaFlag,
        color: "bg-red-500",
      },

      {
        title: "Analytics",
        value: "100%",
        subtitle: "Healthy",
        icon: FaChartBar,
        color: "bg-purple-500",
      },
    ],

    quickActions: [
      {
        title: "Manage Users",
        description: "View all registered users.",
        icon: FaUsers,
        color: "bg-blue-500",
        route: "/admin/users",
      },

      {
        title: "Platform Analytics",
        description: "Monitor the platform.",
        icon: FaChartBar,
        color: "bg-green-500",
        route: "/admin/analytics",
      },
    ],
  },
};