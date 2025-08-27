const WAITING_STATES = Object.freeze({
    DESCRIPTION: 'description',
    COLOR: 'color',
    GENDER: 'gender',
    IMAGE: 'image',
    IMAGE_2: 'image_2'
});

const GENDER_MAP = Object.freeze({
    '1': 'male', 'pria': 'male', 'male': 'male',
    '2': 'female', 'wanita': 'female', 'female': 'female'
});

const COLOR_MAP = Object.freeze({
    '1': 'white', '2': 'blue', '3': 'gray', '4': 'black',
    'white': 'white', 'putih': 'white',
    'blue': 'blue', 'biru': 'blue',
    'gray': 'gray', 'abu': 'gray',
    'black': 'black', 'hitam': 'black'
});

module.exports = {
    WAITING_STATES,
    GENDER_MAP,
    COLOR_MAP
};
