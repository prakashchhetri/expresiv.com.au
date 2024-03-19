import { Box, Layout, Smartphone, PieChart, Trello, Search } from 'lucide-react';
import '../styles/IconCard.css'

interface IconCardProps {
    title: string;
    description: string;
    icon: string;
}

const IconCard: React.FC<IconCardProps> = ({ title, description, icon }) => {
    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case "Box":
                return <Box />;
            case "Layout":
                return <Layout />;
            case "Smartphone":
                return <Smartphone />;
            case "PieChart":
                return <PieChart />;
            case "Trello":
                return <Trello />;
            case "Search":
                return <Search />;
            default:
                return null;
        }
    };

    return (
        <div className="border-solid border border-[#E4E4E7] p-8 rounded-3xl relative overflow-hidden iconCard">
            <div aria-hidden="true" className="absolute inset-0 opacity-20 dark:opacity-20 top-[-20px]">
                <div className="light-bg blur-[50px] h-10"></div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl h-[60px] w-[60px] p-3 flex items-center justify-center">
                {renderIcon(icon)}
            </div>
            <h4 className="mt-5 text-lg font-semibold">{title}</h4>
            <p className="mt-1">{description}</p>
        </div>
    );
};

export default IconCard;
