const parseRequestDate = (dateAsString) => {
    const [day, month, year] = dateAsString
        .split('-')
        .map(number => parseInt(number, 10))
    return new Date(year, month - 1, day)
}

module.exports = {
    parseRequestDate
}
