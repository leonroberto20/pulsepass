package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.domain.Artist;
import com.pulsepass.pulsepass.dto.response.ArtistResponse;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.ArtistMapper;
import com.pulsepass.pulsepass.repository.ArtistRepository;
import com.pulsepass.pulsepass.service.impl.ArtistServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArtistServiceImplTest {

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private ArtistMapper artistMapper;

    @InjectMocks
    private ArtistServiceImpl artistService;

    @Test
    @DisplayName("Buscar artista por ID existente")
    void shouldFindArtistById() {
        Artist artist = new Artist();
        artist.setId(1L);
        ArtistResponse response = new ArtistResponse(1L, "Solar Beat", "Colombia", "Electronic", true);

        when(artistRepository.findById(1L)).thenReturn(Optional.of(artist));
        when(artistMapper.toResponse(artist)).thenReturn(response);

        ArtistResponse result = artistService.findById(1L);

        assertThat(result).isNotNull();
        assertThat(result.stageName()).isEqualTo("Solar Beat");
        verify(artistRepository).findById(1L);
    }

    @Test
    @DisplayName("Buscar artista por stageName existente")
    void shouldFindArtistByStageName() {
        Artist artist = new Artist();
        artist.setStageName("Solar Beat");
        ArtistResponse response = new ArtistResponse(1L, "Solar Beat", "Colombia", "Electronic", true);

        when(artistRepository.findByStageNameIgnoreCase("Solar Beat")).thenReturn(Optional.of(artist));
        when(artistMapper.toResponse(artist)).thenReturn(response);

        ArtistResponse result = artistService.findByStageName("Solar Beat");

        assertThat(result).isNotNull();
        assertThat(result.stageName()).isEqualTo("Solar Beat");
    }

    @Test
    @DisplayName("Buscar artista inexistente lanza ResourceNotFoundException")
    void shouldThrowExceptionWhenArtistNotFound() {
        when(artistRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> artistService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Artist not found with id: 99");
    }

    @Test
    @DisplayName("Listar artistas activos")
    void shouldFindActiveArtists() {
        Artist artist = new Artist();
        artist.setStageName("Solar Beat");
        ArtistResponse response = new ArtistResponse(1L, "Solar Beat", "Colombia", "Electronic", true);

        when(artistRepository.findByActiveTrueOrderByStageNameAsc()).thenReturn(List.of(artist));
        when(artistMapper.toResponse(artist)).thenReturn(response);

        List<ArtistResponse> list = artistService.findActiveArtists();

        assertThat(list).hasSize(1);
        assertThat(list.get(0).stageName()).isEqualTo("Solar Beat");
    }
}
