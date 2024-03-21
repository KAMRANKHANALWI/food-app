import axios from 'axios'
import { initAdmin } from './admin'
import moment from 'moment'

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 2000); 
}

function updateCart(pizza) {
    axios.post('/update-cart', pizza).then(res => {
        cartCounter.innerText = res.data.totalQty
        showNotification('Item added to cart');
    })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        console.log(e)
        // get pizza
        let pizza = JSON.parse(btn.dataset.pizza)
        updateCart(pizza)
    })
})

// Remove alert message after X seconds 
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}

// Change order status
let statuses = document.querySelectorAll('.status_line')
console.log(statuses)
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true
    statuses.forEach((status) => {
        let dataProp = status.dataset.status
        if(stepCompleted) {
            status.classList.add('step-completed')
        }
        if(dataProp === order.status) {
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if(status.nextElementSibling) {
                status.nextElementSibling.classList.add('current')
            }
        }
    })
}

updateStatus(order)

// Socket
let socket = io()
initAdmin(socket)
// Join
if(order) {
    socket.emit('join', `order_${order._id}`)
}
let adminAreaPath = window.location.pathname
console.log(adminAreaPath)
if(adminAreaPath.includes('admin')) {
    socket.emit('join', 'adminRoom')
}

socket.on('orderUpdated', (data) => {
    const updatedOrder = { ...order }
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    showNotification('Order Updated')
    
})