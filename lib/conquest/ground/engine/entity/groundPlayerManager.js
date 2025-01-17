import { 
    BoxGeometry, Triangle, MeshBasicMaterial,
    Mesh, Vector3, TextGeometry,
    Texture, SpriteMaterial, Sprite, PlaneGeometry, BufferGeometry
} from 'three';


const generateLabel = (text = '???') => {
    const canvas = document.createElement('canvas');
    const size = 256; // CHANGED
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff'; // CHANGED
    context.textAlign = 'center';
    context.font = '24px Arial';
    context.fillText(text, size / 2, size / 2);

    const amap = new Texture(canvas);
    amap.needsUpdate = true;

    const mat = new SpriteMaterial({
        map: amap,
        transparent: true,
        color: 0xffffff
    });

    const textSprite = new Sprite(mat);
    textSprite.scale.set(10, 10, 1);
    textSprite.position.set(0, 1.75, 0);
    return textSprite;
}

const generatePointer = () => {
    const pointerGeometry = new BoxGeometry(.25, .25, .25);
    const pointerMaterial = new MeshBasicMaterial({ 
        color: 'white', wireframe: true
    });

    // Create the pointer primary object.
    const pointerMesh = new Mesh(pointerGeometry, pointerMaterial);

    // pointerMesh.scale.set(10, 10, 1);
    pointerMesh.position.set(0, 1.75, 0);

    return pointerMesh;
}

export default class GroundPlayerManager {

    static spawn(config) {
        const { position } = config;

        // Generate geometry and materials for this player object.
        const playerGeometry = new BoxGeometry(2, 2, 2);
        const playerMaterial = new MeshBasicMaterial({ 
            color: config.color,
            wireframe: true
        });

        // Create the player primary object.
        const playerMesh = new Mesh(playerGeometry, playerMaterial);

        // Generate and attach the pointer to the player to indicate direction.
        const playerPointer = generatePointer();
        playerMesh.add(playerPointer);

        // Set the position based on what the server returns.
        playerMesh.position.set(position.x, position.y, position.z);

        // Add the player to the relevent scene layer.
        window.GROUND_LEVEL.scene.add(playerMesh);

        // Add label to mesh.
        const label = generateLabel(config.username);
        window.GROUND_LEVEL.scene.add(label);

        // Add for global data access. =p
        window.GROUND_LEVEL.players[config.id] = {
            // Add a reference to player ID
            id: config.id,
            username: config.username,

            // Add mesh ID here.
            mesh_id: playerMesh.uuid,

            // Add mesh for easier testing, may be less performant for now.
            mesh: playerMesh,

            // The label object for easy tracking
            label,
            
            // The spawn position of the object.
            position,

            direction: new Vector3(0, 0, 0),
            rotation: new Vector3(0, 0, 0)
        };

        return window.GROUND_LEVEL.players[config.id];
    }

    static move(move) {
        window.GROUND_LEVEL.socket
            .emit('player_moved', move);
    }
}