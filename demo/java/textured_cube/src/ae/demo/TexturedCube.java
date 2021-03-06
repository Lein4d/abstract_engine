package ae.demo;

import static org.lwjgl.glfw.GLFW.*;

import ae.core.AbstractEngine;
import ae.core.SceneGraph;
import ae.core.Texture;
import ae.core.TextureBuilder;
import ae.math.Vector4D;
import ae.mesh.Meshes;
import ae.scenegraph.entities.Camera;
import ae.scenegraph.entities.DirectionalLight;
import ae.scenegraph.entities.Model;

public final class TexturedCube {
	
	public static void main(final String[] args) {
		
		// The engine and a scenegraph are the basic components
		final AbstractEngine engine     =
			new AbstractEngine(
				"Textured Cube (AE " + AbstractEngine.VERSION_STRING + ")",
				null, null, false, 10);
		final SceneGraph     sceneGraph = new SceneGraph(engine);
		
		// The camera is adaptive and doesn't need to be updated
		final Camera camera = new Camera(
			sceneGraph,
			"camera",
			new Camera.AdaptiveFOV().setMinHorFOV(Camera.RATIO_SQUARE, 60));
		
		// The crate texture is loaded from a file and the filtering is
		// properly set to remove visual artifacts like anti-aliasing
		final Texture crateTexture = new TextureBuilder().
			setData("crate.jpg").
			setFiltering(true, true, true, true, 16).
			createTexture();
		
		// Use a standard cube for the crate and apply some fancy rotation
		// Apply a standard material with diffuse light computation
		final Model crate = new Model(sceneGraph).
			setMesh(Meshes.createCube(1, true).createMesh()).
			setMaterial(
				engine.standardMaterials.get(true, false, true, false, false)).
			setDiffuseTexture(crateTexture).
			setUpdateCallback((event) -> {
				event.host.transformation.getValue().
					toIdentity().
					translate(0, 0, -2).
					rotateZ(event.getTimeF() / 200f).
					rotateY(event.getTimeF() / 140f).
					rotateX(event.getTimeF() / 90f);
			});
		
		// We place an ambient light source to also light the back sides of the
		// cube
		final DirectionalLight light =
			new DirectionalLight(sceneGraph).makeAmbient();
		
		// Set light parameters
		light.color    .getValue().setData(Vector4D.WHITE.xyz);
		light.direction.getValue().setData(0, 1, 1);
		
		// Add the camera, the crate and the light source to the scenegraph
		// All entities will be children of the root entity
		sceneGraph.root.addChild(camera);
		sceneGraph.root.addChild(crate);
		sceneGraph.root.addChild(light);
		
		// Make the background black
		engine.background.setData(Vector4D.BLACK.xyz);
		
		// Apply the camera to the whole screen
		engine.display.setCamera(camera);
		
		// React to keyboard input
		engine.input.onKeyDown.addListener((event) -> {
			switch(event.getKey()) {
				case GLFW_KEY_ESCAPE: engine.stop();              break;
				case GLFW_KEY_T:      engine.fullscreen.toggle(); break;
				case GLFW_KEY_0:      engine.setSpeed(0);         break;
				case GLFW_KEY_1:      engine.setSpeed(0.5);       break;
				case GLFW_KEY_2:      engine.setSpeed(1);         break;
				case GLFW_KEY_3:      engine.setSpeed(2);         break;
			}
		});
		
		// Begin rendering
		engine.start();
	}
}
