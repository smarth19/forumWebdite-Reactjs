export default function convertName(name){
    let splitName = name.trim().split(' ').filter(e => e !== '')
    let properName = ''
    splitName.forEach((e)=>{
        let first = e.charAt(0).toUpperCase()
        let rest = e.substr(1)
        properName += first + rest + ' '
    })
    return properName.trim()
} 