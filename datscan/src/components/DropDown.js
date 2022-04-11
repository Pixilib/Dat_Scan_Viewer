export default () => {

    const values = ['axial', 'sagittal', 'coronal', 'oblique']
    const defaultValue = 'sagittal';
    const select = document.getElementById('liste')

    values.forEach((value) => {
        const optionElement = document.createElement('option');
        console.log(optionElement)

        optionElement.value = String(value);
        optionElement.innerText = String(value);

        if (value === defaultValue) {
            optionElement.selected = true;
        }

        select.append(optionElement)
    });


    return (
        <>
            <select id='liste' name="liste"></select>
        </>
    )
}