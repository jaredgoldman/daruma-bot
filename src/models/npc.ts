export default class NPC {
  constructor() {
    this.dead = false
  }

  private dead: boolean
  isDead() {
    return this.dead
  }
  setDead() {
    this.dead = true
  }
}
