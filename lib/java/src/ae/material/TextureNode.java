package ae.material;

import ae.core.Texture;

import static org.lwjgl.opengl.GL11.*;
import static org.lwjgl.opengl.GL13.*;
import static org.lwjgl.opengl.GL20.*;

public final class TextureNode extends Node {
	
	private Texture _texture     = null;
	private int     _uniLocation = -1;
	
	public final String uniName;
	
	public TextureNode(
			final String name,
			final String texCoord) {
		
		super(name, texCoord);
		this.uniName = "u_s2D_" + name;
	}

	@Override
	public final void computeTypes() {
		
		if(_getInputDimension(0) != 2)
			throw new UnsupportedOperationException(
				"Input tex-coord must be of dimension 2");
		
		_addOutput(null, 4);
		_typingSuccessful();
	}
	
	public final TextureNode setTexture(final Texture texture) {
		_texture = texture;
		return this;
	}
	
	public final TextureNode setUniformLocation(final int location) {
		if(_uniLocation == -1 && location != -1) _uniLocation = location;
		return this;
	}
	
	@Override
	public final void toSourceString(final StringBuilder dst) {
		dst.append("texture(").append(uniName).append(", ");
		_getInputNode(0).toSourceString(dst);
		dst.append(')');
	}
	
	public final void useTexture(final int slot) {
		
		glActiveTexture(GL_TEXTURE0 + slot);
		
		if(_texture != null) {
			_texture.use();
		} else {
			glBindTexture(GL_TEXTURE_2D, 0);
		}
		
		glUniform1i(_uniLocation, slot);
	}
}
