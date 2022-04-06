import * as cornerstone from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import React, { Component, useEffect, useState } from 'react';
import Drop from './DropZone';
import ButtonToToolbar from "./ButtonOnToolBar"

export default () => {

    const [file, setfile] = useState(0);
    const renderingEngineId = 'myEngine';
    const viewportIdentifiant = 'CT_STACK'
    const [count, setCount] = useState(0);
    let imageIdDefault = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);

    const buttonNextImage = () => {
        if (file !== 0) {
            //Recuperation de l'engine actuel
            const renderingEngine = cornerstone.getRenderingEngine(renderingEngineId);

            //Recuperation de la div d'affichage
            const divAff = document.getElementById("test")

            const viewportInput = {
                viewportId: viewportIdentifiant,
                element: divAff,
                type: cornerstone.Enums.ViewportType.STACK,
            };
            renderingEngine.enableElement(viewportInput);

            //Recup du viewport
            const viewport = renderingEngine.getViewport(viewportIdentifiant);

            //On incremente l'index
            setCount(count + 1);
            const currentImageidIndex = imageIdDefault + "?frame=" + count;
            console.log(currentImageidIndex)

            const stack = [currentImageidIndex]
            viewport.setStack(stack)
            viewport.render()
        }

    }

    const buttonPreviousImage = () => {
        if (count > 0 && file !== 0) {
            //Recuperation de l'engine actuel
            const renderingEngine = cornerstone.getRenderingEngine(renderingEngineId);

            //Recuperation de la div d'affichage
            const divAff = document.getElementById("test")

            const viewportInput = {
                viewportId: viewportIdentifiant,
                element: divAff,
                type: cornerstone.Enums.ViewportType.STACK,
            };
            renderingEngine.enableElement(viewportInput);
            //Recup du vieport
            const viewport = renderingEngine.getViewport(viewportIdentifiant);

            //On décremente l'index
            setCount(count - 1);
            const currentImageidIndex = imageIdDefault + "?frame=" + count;
            console.log(currentImageidIndex)

            const stack = [currentImageidIndex]
            viewport.setStack(stack)
            viewport.render()
        }

    }

    const buttonFlipH = () => {
        const renderingEngine = cornerstone.getRenderingEngine(renderingEngineId);

        const viewport = renderingEngine.getViewport(viewportIdentifiant);

        const { flipHorizontal } = viewport.getProperties();

        viewport.setProperties({ flipHorizontal: !flipHorizontal });

        viewport.render();
    }

    const buttonFlipV = () => {
        const renderingEngine = cornerstone.getRenderingEngine(renderingEngineId);

        const viewport = renderingEngine.getViewport(viewportIdentifiant);

        const { flipVertical } = viewport.getProperties();

        viewport.setProperties({ flipVertical: !flipVertical });

        viewport.render();
    }

    const buttonResetView = () => {
        const renderingEngine = cornerstone.getRenderingEngine(renderingEngineId)

        const vieport = renderingEngine.getViewport(viewportIdentifiant)

        //On reset la caméra
        vieport.resetCamera();
        //On reset les propriétes (deplacement H/V...)
        vieport.resetProperties();
        vieport.render();
    }


    useEffect(() => {

        const run = async () => {
            //Configuration et initialisation des libraries

            await cornerstone.init();
            initCornerstoneWADOImageLoader();
            const divAff = document.getElementById("viewer");

            divAff.style.width = "500px"
            divAff.style.height = "500px"

            const imageId = imageIdDefault + "?frame=" + 0
            console.log(imageId)

            const renderingEngine = new cornerstone.RenderingEngine(renderingEngineId)


            const viewportInput = {
                viewportId: viewportIdentifiant,
                element: divAff,
                type: cornerstone.Enums.ViewportType.STACK,
            };

            renderingEngine.enableElement(viewportInput);

            const viewport = renderingEngine.getViewport(viewportIdentifiant);

            const stack = [imageId]
            viewport.setStack(stack)

            viewport.render()
        }
        if (file !== 0) {
            document.getElementById('toolbar').hidden = false
            run()
        } else {
            document.getElementById('toolbar').hidden = true
        }

    }, [file])


    return (
        <>
            <h1>DatScan Viewer</h1>
            <Drop set={setfile}></Drop>
            <div id='toolbar'>
                <ButtonToToolbar title='Previous Image' onClick={buttonPreviousImage}></ButtonToToolbar>
                <ButtonToToolbar title='Next Image' onClick={buttonNextImage}></ButtonToToolbar>
                <ButtonToToolbar title='Horizontal Flip' onClick={buttonFlipH}></ButtonToToolbar>
                <ButtonToToolbar title='Vertical Flip' onClick={buttonFlipV}></ButtonToToolbar>
                <ButtonToToolbar title='Reset' onClick={buttonResetView}></ButtonToToolbar>
            </div>
            <div id="viewer"></div>

        </>
    )

}