import { timingSafeEqual } from "crypto"

class Promise {
  constructor(executor) {
    this.status = 'pending'
    this.reason = undefined
    this.value = undefined
    this.onResolveCallbacks = []
    this.onRejectCallbacks = []
    const resolve = data => {
      if (this.status === 'pending') {
        this.value = data
        this.status = 'resolved'
        this.onRejectCallbacks.forEach(fn => fn())
      }
    }
    const reject = reason => {
      if (this.status === 'pending') {
        this.reason = reason
        this.status = 'rejected'
        this.onResolveCallbacks.forEach(fn => fn())
      }
    }
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }
  then(onResolved, onRejected) {
    onResolved = typeof onResolved === 'function' ? onResolved : y => y
    onRejected = typeof onRejected === 'function' ? onRejected : error => {throw error}
    let Promise
    if (this.status == 'pending') {
      new Promise((resolve, reject) => {
        setTimeout(() => {
          
        }, timeout);
      }) 
    }
  }
}