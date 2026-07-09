import {
  FaHome,
  FaUser,
  FaBriefcase,
  FaSearch,
  FaClipboardList,
  FaComments,
  FaCog,
  FaUsers,
  FaChartBar,
  FaFlag,
  FaPlusCircle,
  FaTasks,
  FaEnvelopeOpen,
  
} from "react-icons/fa";

export const sidebarMenus = {
  freelancer: [
    {
      label: "Dashboard",
      icon: FaHome,
      route: "/freelancer/dashboard",
    },

    {
      label: "My Profile",
      icon: FaUser,
      route: "/freelancer/profile",
    },

    {
      label: "Invitations",
      icon: FaEnvelopeOpen,
      route: "/freelancer/invitations",
    },

    {
      label: "Marketplace",
      icon: FaBriefcase,
      route: "/client/marketplace",
    },

    {
      label: "Applications",
      icon: FaClipboardList,
      route: "/applications",
    },

    {
      label: "Messages",
      icon: FaComments,
      route: "/messages",
    },

    {
      label: "Settings",
      icon: FaCog,
      route: "/settings",
    },
  ],

  client: [
    {
      label: "Dashboard",
      icon: FaHome,
      route: "/client/dashboard",
    },
    {
      label: "My Profile",
      icon: FaUser,
      route: "/client/profile",
    },
    {
      label: "Marketplace",
      icon: FaBriefcase,
      route: "/client/marketplace",
    },
    {
      label: "Post Project",
      icon: FaPlusCircle,
      route: "/client/post-project",
    },

    {
      label: "My Projects",
      icon: FaTasks,
      route: "/client/projects",
    },

    {
      label: "Browse Freelancers",
      icon: FaSearch,
      route: "/client/browse",
    },

    {
      label: "Messages",
      icon: FaComments,
      route: "/messages",
    },

    {
      label: "Settings",
      icon: FaCog,
      route: "/settings",
    },
  ],

  admin: [
    {
      label: "Dashboard",
      icon: FaHome,
      route: "/admin/dashboard",
    },

    {
      label: "Users",
      icon: FaUsers,
      route: "/admin/users",
    },

    {
      label: "Analytics",
      icon: FaChartBar,
      route: "/admin/analytics",
    },

    {
      label: "Reports",
      icon: FaFlag,
      route: "/admin/reports",
    },

    {
      label: "Settings",
      icon: FaCog,
      route: "/settings",
    },
  ],
};
