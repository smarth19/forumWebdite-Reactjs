export default function quesAddedAgo(time) {
    let currentDate = new Date()
    let qtime = new Date(time).getTime()
    if (currentDate.getTime() - qtime > 60000 && currentDate.getTime() - qtime <= 3600000) {
        let elapsedTime = Math.floor((currentDate.getTime() - qtime) / 60000)
        return `${elapsedTime} minutes ago`
    } else if (currentDate.getTime() - qtime >= 0 && currentDate.getTime() - qtime <= 60000) {
        let elapsedTime = Math.floor((currentDate.getTime() - qtime) / 1000)
        return `${elapsedTime} seconds ago`
    } else if (currentDate.getTime() - qtime > 3600000 && currentDate.getTime() - qtime <= 86400000) {
        let elapsedTime = Math.floor((currentDate.getTime() - qtime) / 3600000)
        return `${elapsedTime} hours ago`
    } else if (currentDate.getTime() - qtime > 86400000 && currentDate.getTime() - qtime <= 2678400000) {
        let elapsedTime = Math.floor((currentDate.getTime() - qtime) / 86400000)
        return `${elapsedTime} days ago`
    } else if (currentDate.getTime() - qtime > 2678400000) {
        let d = new Date(time)
        let day = d.getMonth()
        let date = d.getDate()
        let year = d.getFullYear()
        let hour = d.getHours()
        let min = d.getMinutes()
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return `${date} ${monthNames[day]} ${year} at ${hour}:${min}`
    }
}