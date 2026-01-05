import React from 'react';
import  classes from './index.module.css'
import AnimatedImage from '@/components/Ui/AnimatedImage';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

const ContactHero = ({image, title, subTitle}) => {
    return (
        <div className={classes.root}>
            <div className={classes.overlay}></div>
            <div className={classes.cont}>
                <h1 className={classes.title}>{documentToReactComponents(title)}</h1>
                <span className='text-lg text-white text-center mx-auto block w-full'>{subTitle}</span>
            </div>
            <AnimatedImage image={image} className={classes.image} priority={true} />
        </div>
    );
};

ContactHero.propTypes = {
    
};

export default ContactHero;