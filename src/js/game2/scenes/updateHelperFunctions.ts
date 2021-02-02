import { addPlayer } from './createHelperFunctions';

const respawnPlayer = (_this: any) => {
    _this.player.anims.stop();
    _this.player.destroy();
    _this.player = null;
    _this.hitBox.destroy();
    _this.hitBox = null;
    _this.container.destroy();
    _this.container = null;
    _this.isExtraAttacking = false;
    _this.isAutoAttacking = false;
    console.log('respawn player', _this.playerStats);
    addPlayer(_this);
};

const checkPlayerStats = (_this: any) => {
    if (_this.player) {
        if (_this.playerStats.health.current <= 0) {
            respawnPlayer(_this);
        }
    }
}

export default {
    respawnPlayer,
    checkPlayerStats
}