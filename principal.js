function toggleOptions(optionId) {
    const options = document.getElementById(optionId);
    options.classList.toggle('hidden'); // Cambié 'toogle' por 'toggle'
    console.log("Options toggled:", optionId);
}