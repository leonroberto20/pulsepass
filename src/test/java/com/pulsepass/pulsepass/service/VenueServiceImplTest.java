package com.pulsepass.pulsepass.service;

import com.pulsepass.pulsepass.domain.Venue;
import com.pulsepass.pulsepass.dto.response.VenueResponse;
import com.pulsepass.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.pulsepass.mapper.VenueMapper;
import com.pulsepass.pulsepass.repository.VenueRepository;
import com.pulsepass.pulsepass.service.impl.VenueServiceImpl;
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
class VenueServiceImplTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private VenueMapper venueMapper;

    @InjectMocks
    private VenueServiceImpl venueService;

    @Test
    @DisplayName("Buscar venue por código existente")
    void shouldFindVenueByCode() {
        Venue venue = new Venue();
        venue.setCode("VEN-01");
        VenueResponse response = new VenueResponse(1L, "VEN-01", "Marina Center", "Santa Marta", "Dir", 1000, true);

        when(venueRepository.findByCode("VEN-01")).thenReturn(Optional.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(response);

        VenueResponse result = venueService.findByCode("VEN-01");

        assertThat(result).isNotNull();
        assertThat(result.code()).isEqualTo("VEN-01");
        verify(venueRepository).findByCode("VEN-01");
    }

    @Test
    @DisplayName("Buscar venue inexistente lanza ResourceNotFoundException")
    void shouldThrowExceptionWhenVenueNotFound() {
        when(venueRepository.findByCode("UNKNOWN")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> venueService.findByCode("UNKNOWN"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Venue not found with code: UNKNOWN");
    }

    @Test
    @DisplayName("Listar venues activos")
    void shouldFindActiveVenues() {
        Venue venue = new Venue();
        venue.setCode("VEN-01");
        VenueResponse response = new VenueResponse(1L, "VEN-01", "Marina Center", "Santa Marta", "Dir", 1000, true);

        when(venueRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(response);

        List<VenueResponse> list = venueService.findActiveVenues();

        assertThat(list).hasSize(1);
        assertThat(list.get(0).code()).isEqualTo("VEN-01");
        verify(venueRepository).findByActiveTrueOrderByNameAsc();
    }
}
