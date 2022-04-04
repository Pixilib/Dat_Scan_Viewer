import { RenderingEngine, Enums, init, } from '@cornerstonejs/core';
import React, { Component } from 'react';

//Si il y a une erreur avec le init, commenter le si il ne l'est pas ou décommenter le si il l'est puis enregister
init()

export default () => {

    // const divAff = React.createElement('div', {})
    const divAff = document.createElement('div')
    const imageId = 'wadouri:/images/MR000000.dcm'

    const renderingEngineId = 'myEngine';
    const renderingEngine = new RenderingEngine(renderingEngineId)


    const viewportIdentifiant = 'CT_AXIAL_STACK'
    const viewportInput = {
        viewportId: viewportIdentifiant,
        element: divAff,
        type: Enums.ViewportType.STACK,
    };

    renderingEngine.enableElement(viewportInput);

    const viewport = renderingEngine.getViewport(viewportIdentifiant);

    viewport.setStack(imageId, 60);

    viewport.render()

    return (
        <>
            <div className='content'></div>
        </>
    )

}