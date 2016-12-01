package ae.demo;

import static org.lwjgl.glfw.GLFW.*;

import ae.core.AbstractEngine;
import ae.core.InputListener;
import ae.core.SceneGraph;
import ae.core.Texture;
import ae.core.TextureBuilder;
import ae.entity.DirectionalLight;
import ae.entity.Model;
import ae.math.Vector4D;
import ae.mesh.Meshes;

public final class TexturedCube {
	
	public static void main(final String[] args) {
		
		// The engine and a scenegraph are the basic components
		final AbstractEngine engine     = new AbstractEngine("Triangle");
		final SceneGraph     sceneGraph = new SceneGraph();
		
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
			setUpdater((model, time, delta) -> {
				model.transformation.getValue().
					toIdentity().
					translate(0, 0, -4).
					rotateZ((float)time / 200f).
					rotateY((float)time / 140f).
					rotateX((float)time / 90f);
			});
		
		// We place an ambient light source to also light the back sides of the
		// cube
		final DirectionalLight light =
			new DirectionalLight(sceneGraph).makeAmbient();
		
		// Set the diffuse crate texture
		crate.textures.getValue().diffuse = crateTexture;
		
		// Set light parameters
		light.color    .getValue().setData(Vector4D.WHITE.xyz);
		light.direction.getValue().setData(0, 1, 1);
		
		// Add the crate and the light source to the scenegraph
		// Both entities will be children of the root entity
		sceneGraph.root.addChild(crate);
		sceneGraph.root.addChild(light);
		
		// Make the background black
		engine.background.setData(Vector4D.BLACK.xyz);
		
		// Attach the scenegraph to the engine
		engine.setSceneGraph(sceneGraph);
	
		// React to keyboard input
		engine.setInputListener(new InputListener() {
			
			@Override
			public final void onKeyDown(
					final int key) {
				
				switch(key) {
					case GLFW_KEY_ESCAPE: engine.stop();             break;
					case GLFW_KEY_T:      engine.toggleFullscreen(); break;
					case GLFW_KEY_0:      engine.setSpeed(0);        break;
					case GLFW_KEY_1:      engine.setSpeed(0.5);      break;
					case GLFW_KEY_2:      engine.setSpeed(1);        break;
					case GLFW_KEY_3:      engine.setSpeed(2);        break;
				}
			}
		});
		
		// Recompute the projection matrix on window resize
		engine.setResizeCallback((eng) -> {
			engine.projection.toIdentity().projectPerspectiveHorFOV(
				engine.getFramebufferWidth(), engine.getFramebufferHeight(),
				60, 2);
		});
		
		// Begin rendering
		engine.start();
	}
}
