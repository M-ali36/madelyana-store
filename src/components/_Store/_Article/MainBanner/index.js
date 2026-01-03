import React from 'react';
import  classes from './index.module.css'
import AnimatedImage from '@/components/Ui/AnimatedImage';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

const MainBanner = ({image, featuredTitle}) => {
    return (
        <div className={classes.root}>
            <div className={classes.overlay}></div>
            <div className={classes.cont}>
                <h1 className={classes.title}>{documentToReactComponents(featuredTitle)}</h1>
            </div>
            <AnimatedImage image={image.url} className={classes.image} priority={true} />
        </div>
    );
};

MainBanner.propTypes = {
    
};

export default MainBanner;