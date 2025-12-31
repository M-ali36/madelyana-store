import React from 'react';
import PropTypes from 'prop-types';
import  classes from './index.module.css'
import Image from '@/components/Ui/Image';
import AnimatedImage from '@/components/Ui/AnimatedImage';

const MainBanner = ({image, title, featuredTitle, descriptions}) => {
    return (
        <div className={classes.root}>
            <div className={classes.overlay}></div>
            <div className={classes.cont}>
                <h1 className={classes.title}>{featuredTitle}</h1>
                <span className={classes.description}>{descriptions}</span>
            </div>
            <AnimatedImage image={image.url} className={classes.image} priority={true} />
        </div>
    );
};

MainBanner.propTypes = {
    
};

export default MainBanner;