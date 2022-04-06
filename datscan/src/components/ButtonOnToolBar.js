export default ({ title, onClick, set }) => {

    return (
        <>
            <button id="buttonToolBar" onClick={onClick}>{title}</button>
        </>
    )
}