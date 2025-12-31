import { HiMail, HiLink, HiOutlineGlobeAlt } from "react-icons/hi";
import {
  SiInstagram,
  SiFacebook,
  SiTiktok,
  SiYoutube,
  SiLinkedin,
  SiX,
} from "react-icons/si";
import { SlSocialFacebook } from "react-icons/sl";

/**
 * Maps CMS icon string → React Icon component
 *
 * Supported CMS values:
 * Instagram, Facebook, Tiktok, Youtube, Linkeden, Email, X
 */
export function getSocialIcon(iconName, className = "w-5 h-5") {
  if (!iconName || typeof iconName !== "string") {
    return <HiLink className={className} />;
  }

  const key = iconName.trim().toLowerCase();

  const iconMap = {
    instagram: <SiInstagram className={className} />,
    facebook: <SlSocialFacebook className={className} />,
    tiktok: <SiTiktok className={className} />,
    youtube: <SiYoutube className={className} />,
    linkeden: <SiLinkedin className={className} />, // CMS typo-safe
    linkedin: <SiLinkedin className={className} />,
    x: <SiX className={className} />,
    email: <HiMail className={className} />,
    link: <HiLink className={className} />,
    website: <HiOutlineGlobeAlt className={className} />,
  };

  return iconMap[key] || <HiLink className={className} />;
}
