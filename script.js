const random = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const default_url = `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLdTaSlbaXyuxM_FeSQeELTfWRaQjCh6AaQA&usqp=CAU`
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const img = document.querySelector('img')
img.src = default_url

const generate = ({
  circles_amount_mult = 3,
  background = false,
  gradient = true,
  inc_mult = { x: 5, y: 5 },
  pos_mult = { x: 3, y: 3 },
  radius = 7.5,
  start_pos = {
    x: () => img.width / 2 + random(-150, 150),
    y: () => img.height / 2 + random(-100, 100),
  },
}) => {
  const color_thief = new ColorThief()
  const palette = color_thief.getPalette(img, 15)

  canvas.width = window.innerWidth / 2
  canvas.height = window.innerHeight
  img.style.objectFit = img.width < img.height ? 'cover' : 'contain'

  if (background) {
    const [r, g, b] = color_thief.getColor(img)
    canvas.style.background = `rgb(${r}, ${g}, ${b})`
  }

  palette.reverse().map((color, i) => {
    const [r, g, b] = color
    const circles_amount = i * circles_amount_mult
    const dir_x = random(0, 1)
    const dir_y = random(0, 1)

    let posX = start_pos.x()
    let posY = start_pos.y()
    let inc_x = 0
    let inc_y = 0

    for (let i = 0; i < circles_amount; i++) {
      const x = dir_x
        ? posX + inc_x + i * pos_mult.x
        : posX - inc_x - i * pos_mult.x
      const y = dir_y
        ? posY + inc_y + i * pos_mult.y
        : posY - inc_y - i * pos_mult.y

      const circle = new Path2D()
      circle.arc(x, y, radius, 0, 2 * Math.PI)

      if (gradient) {
        const grad = context.createRadialGradient(x, y, 0, x, y, radius)
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`)
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        context.fillStyle = grad
      } else {
        context.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`
      }

      context.fill(circle)

      inc_x = inc_x + random(-radius * inc_mult.x, radius * inc_mult.x)
      inc_y = inc_y + random(-radius * inc_mult.y, radius * inc_mult.y)
    }
  })
}

const random_grapes = () =>
  generate({
    radius: 4,
    circles_amount_mult: 100,
    start_pos: {
      x: () => random(0, window.innerWidth / 2),
      y: () => random(0, window.innerHeight),
    },
    gradient: false,
    background: true,
  })

if (img.complete) {
  random_grapes()
} else {
  img.addEventListener('load', () => random_grapes())
}

const drop_img = (e) => {
  e.preventDefault()
  const file = e.dataTransfer.files[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
    return
  }

  const url = e.dataTransfer.getData('text/html').match(/src\s*=\s*"(.+?)"/)[1]
  img.src = url
}

const dropzone = document.getElementById('dropzone')
const prev_default = (e) => e.preventDefault()
dropzone.addEventListener('dragenter', prev_default, false)
dropzone.addEventListener('dragover', prev_default, false)
dropzone.addEventListener('drop', drop_img, false)
